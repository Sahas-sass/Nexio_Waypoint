import { enqueue } from '@/features/sync/services/outbox';
import type { LocalDb, SyncActionType } from '@/features/sync/types';
import type { PodPayload } from '@/features/sync/utils/payloads';

import type { StopStatus, TripSnapshot } from '../types';
import { applyPendingActions } from '../utils/applyPending';
import { withStopStatus } from '../utils/stopProgress';
import { loadSnapshot, saveSnapshot } from './tripCache';
import { downloadSnapshot, type TripQueryClient } from './tripService';

export interface TripActionDeps {
  db: LocalDb;
  client: TripQueryClient;
  userId: string;
  isOnline: boolean;
  setSnapshot: (snapshot: TripSnapshot | null) => void;
  /** Called after an action was queued (refresh UI + trigger a sync). */
  onQueued: () => void;
}

/**
 * Download the driver's current trip when online (falling back to the
 * offline copy), overlay unsynced actions and persist it. Returns the snapshot
 * in use. Throws only when there is neither a server copy nor a cached one.
 */
export async function refreshTrip(deps: TripActionDeps): Promise<TripSnapshot | null> {
  const cached = loadSnapshot(deps.db);
  const usable = cached && cached.driver.id === deps.userId ? cached : null;
  if (!deps.isOnline) {
    deps.setSnapshot(usable);
    return usable;
  }
  try {
    const fresh = await downloadSnapshot(deps.client, deps.userId);
    const snapshot = { ...fresh, trip: applyPendingActions(fresh.trip, deps.db.listOutbox()) };
    saveSnapshot(deps.db, snapshot);
    deps.setSnapshot(snapshot);
    return snapshot;
  } catch (error) {
    if (usable) {
      deps.setSnapshot(usable);
      return usable;
    }
    throw error;
  }
}

function updateCachedStop(db: LocalDb, stopId: string, status: StopStatus, completedAt: string | null) {
  const snapshot = loadSnapshot(db);
  if (!snapshot?.trip) return null;
  const next = { ...snapshot, trip: { ...snapshot.trip, stops: withStopStatus(snapshot.trip.stops, stopId, status, completedAt) } };
  saveSnapshot(db, next);
  return next;
}

function queue(deps: TripActionDeps, type: SyncActionType, stopId: string, payload: unknown, status: StopStatus, completedAt: string | null) {
  enqueue(deps.db, type, stopId, payload);
  const next = updateCachedStop(deps.db, stopId, status, completedAt);
  if (next) deps.setSnapshot(next);
  deps.onQueued();
}

/** Mark a stop as in progress locally and queue driver_start_stop. */
export function startStop(deps: TripActionDeps, stopId: string) {
  const stop = loadSnapshot(deps.db)?.trip?.stops.find((s) => s.id === stopId);
  if (!stop || stop.status !== 'PENDING') return;
  queue(deps, 'STATUS_UPDATE', stopId, { stopId }, 'IN_PROGRESS', null);
}

/** Close a stop locally and queue the POD (uploads + RPC happen in the sync engine). */
export function completeStop(deps: TripActionDeps, payload: PodPayload) {
  const status: StopStatus = payload.outcome === 'failed' ? 'FAILED' : 'COMPLETED';
  queue(deps, 'POD_COMPLETE', payload.stopId, payload, status, payload.capturedAt);
}
