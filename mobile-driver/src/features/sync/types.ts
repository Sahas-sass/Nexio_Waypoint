export type SyncActionType = 'STATUS_UPDATE' | 'POD_COMPLETE' | 'LOCATION_UPDATE';

export interface OutboxRow {
  id: string;
  stop_id: string | null;
  action_type: SyncActionType;
  /** JSON-serialised payload (see utils/payloads.ts). */
  payload: string;
  status: 'PENDING' | 'SYNCED';
  attempts: number;
  last_error: string | null;
  created_at: string;
  synced_at: string | null;
}

/** Minimal persistence API used by the sync + trip features (SQLite on native, localStorage on web). */
export interface LocalDb {
  init(): void;
  getCache<T>(key: string): T | null;
  setCache(key: string, value: unknown): void;
  insertOutbox(row: OutboxRow): void;
  /** Every outbox row, oldest first. */
  listOutbox(): OutboxRow[];
  markSynced(id: string, syncedAt: string): void;
  markFailed(id: string, error: string): void;
  /** Merge new values into a row's payload (e.g. storage paths after upload). */
  updatePayload(id: string, payload: string): void;
  /** Wipe every cached value and queued item (used on sign-out). */
  clearAll(): void;
}
