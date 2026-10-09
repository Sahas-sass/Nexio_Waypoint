import type { OutboxRow } from '@/features/sync/types';
import type { PodPayload } from '@/features/sync/utils/payloads';

export type PodSyncState = 'synced' | 'queued' | 'retrying' | 'none';

/** Latest POD outbox row for a stop. */
export function latestPodRow(outbox: OutboxRow[], stopId: string): OutboxRow | null {
  const rows = outbox.filter((r) => r.action_type === 'POD_COMPLETE' && r.stop_id === stopId);
  return rows[rows.length - 1] ?? null;
}

export function podSyncState(row: OutboxRow | null): PodSyncState {
  if (!row) return 'none';
  if (row.status === 'SYNCED') return 'synced';
  return row.last_error ? 'retrying' : 'queued';
}

/** The POD payload stored for a stop (to show items delivered / outcome), or null. */
export function podPayload(row: OutboxRow | null): PodPayload | null {
  if (!row) return null;
  try {
    return JSON.parse(row.payload) as PodPayload;
  } catch {
    return null;
  }
}

/** Clamp a typed / stepped item count to 0..max. */
export function clampItems(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, Math.round(value)));
}
