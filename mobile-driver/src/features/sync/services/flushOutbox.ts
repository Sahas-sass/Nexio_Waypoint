import { base64ToBytes } from '../utils/base64';
import {
  locationRpcArgs,
  podRpcArgs,
  podStoragePaths,
  type LocationPayload,
  type PodPayload,
  type StatusPayload,
} from '../utils/payloads';
import type { LocalDb, OutboxRow } from '../types';

export const POD_BUCKET = 'pod-evidence';

type RpcResult = PromiseLike<{ error: { message: string } | null }>;
type UploadResult = Promise<{ error: { message: string; statusCode?: string } | null }>;

/** The slice of the Supabase client the flusher needs (easy to mock). */
export interface SyncClient {
  rpc(fn: string, args: Record<string, unknown>): RpcResult;
  storage: {
    from(bucket: string): {
      upload(path: string, body: Uint8Array, options: { contentType: string; upsert: boolean }): UploadResult;
    };
  };
}

export interface FlushDeps {
  db: LocalDb;
  client: SyncClient;
  userId: string;
  now?: () => Date;
}

export interface FlushResult {
  synced: number;
  failed: number;
  /** Stop ids whose POD was accepted by the server in this run. */
  completedStops: string[];
}

/** The bucket has no UPDATE policy, so a retry hits "already exists" – that means the first upload worked. */
const isAlreadyUploaded = (error: { message: string; statusCode?: string }) =>
  error.statusCode === '409' || /already exists|duplicate/i.test(error.message);

async function upload(client: SyncClient, path: string, base64: string, contentType: string) {
  const { error } = await client.storage
    .from(POD_BUCKET)
    .upload(path, base64ToBytes(base64), { contentType, upsert: false });
  if (error && !isAlreadyUploaded(error)) throw new Error(`Upload failed: ${error.message}`);
  return path;
}

async function call(client: SyncClient, fn: string, args: Record<string, unknown>) {
  const { error } = await client.rpc(fn, args);
  if (error) throw new Error(error.message);
}

/** Upload evidence (persisting paths so retries skip it), then submit the idempotent POD RPC. */
async function syncPod(deps: FlushDeps, row: OutboxRow) {
  const payload = JSON.parse(row.payload) as PodPayload;
  const paths = podStoragePaths(deps.userId, payload.stopId);
  if (payload.photo && !payload.photoPath) {
    payload.photoPath = await upload(deps.client, paths.photo, payload.photo.base64, payload.photo.mimeType);
    deps.db.updatePayload(row.id, JSON.stringify(payload));
  }
  if (payload.signaturePng && !payload.signaturePath) {
    payload.signaturePath = await upload(deps.client, paths.signature, payload.signaturePng, 'image/png');
    deps.db.updatePayload(row.id, JSON.stringify(payload));
  }
  await call(deps.client, 'submit_proof_of_delivery', podRpcArgs(payload));
}

async function syncRow(deps: FlushDeps, row: OutboxRow) {
  switch (row.action_type) {
    case 'STATUS_UPDATE': {
      const payload = JSON.parse(row.payload) as StatusPayload;
      return call(deps.client, 'driver_start_stop', { p_stop_id: payload.stopId });
    }
    case 'POD_COMPLETE':
      return syncPod(deps, row);
    case 'LOCATION_UPDATE':
      return call(deps.client, 'driver_update_location', locationRpcArgs(JSON.parse(row.payload) as LocationPayload));
  }
}

/**
 * Push every pending outbox row to Supabase in creation order. A failure is
 * recorded on the row and blocks later rows for the same stop (so a POD is
 * never sent before its stop was started); other stops keep syncing.
 */
export async function flushOutbox(deps: FlushDeps): Promise<FlushResult> {
  const now = deps.now ?? (() => new Date());
  const result: FlushResult = { synced: 0, failed: 0, completedStops: [] };
  const blockedStops = new Set<string>();

  for (const row of deps.db.listOutbox()) {
    if (row.status !== 'PENDING') continue;
    if (row.stop_id && blockedStops.has(row.stop_id)) continue;
    try {
      await syncRow(deps, row);
      deps.db.markSynced(row.id, now().toISOString());
      result.synced++;
      if (row.action_type === 'POD_COMPLETE' && row.stop_id) result.completedStops.push(row.stop_id);
    } catch (error) {
      deps.db.markFailed(row.id, error instanceof Error ? error.message : String(error));
      result.failed++;
      if (row.stop_id) blockedStops.add(row.stop_id);
    }
  }
  return result;
}
