import type { LocalDb, OutboxRow, SyncActionType } from '../types';

let counter = 0;

export function newOutboxId(now: Date = new Date()): string {
  counter = (counter + 1) % 1_000_000;
  return `ob_${now.getTime()}_${counter}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Persist an action so it survives restarts until the server accepts it. */
export function enqueue(
  db: LocalDb,
  actionType: SyncActionType,
  stopId: string | null,
  payload: unknown,
  now: Date = new Date()
): OutboxRow {
  const row: OutboxRow = {
    id: newOutboxId(now),
    stop_id: stopId,
    action_type: actionType,
    payload: JSON.stringify(payload),
    status: 'PENDING',
    attempts: 0,
    last_error: null,
    created_at: now.toISOString(),
    synced_at: null,
  };
  db.insertOutbox(row);
  return row;
}

export const pendingRows = (db: LocalDb) => db.listOutbox().filter((r) => r.status === 'PENDING');

/** Pending rows the driver cares about (GPS pings are noise in the UI). */
export const visiblePendingCount = (rows: OutboxRow[]) =>
  rows.filter((r) => r.status === 'PENDING' && r.action_type !== 'LOCATION_UPDATE').length;
