import {
  db,
  type SyncActionType,
  type SyncPayload,
  type SyncQueueRecord,
} from '@/database/schema';
import { useQueueStore } from '@/store/queueStore';

/**
 * Concurrency guard to ensure multiple triggers do not create duplicate sync pushes.
 */
let isSyncing = false;

/**
 * Flushes all pending records from the local SQLite sync queue to the remote backend.
 * Simulates network transmission per record, updates record status upon completion,
 * and maintains the reactive Zustand queueStore pendingCount.
 */
export async function flushSyncQueue(): Promise<void> {
  if (isSyncing) {
    return;
  }

  isSyncing = true;

  try {
    // Query all pending records ordered chronologically
    const pendingRecords = db.getAllSync<SyncQueueRecord>(
      "SELECT * FROM sync_queue WHERE status = 'PENDING' ORDER BY created_at ASC;"
    );

    if (!pendingRecords || pendingRecords.length === 0) {
      useQueueStore.getState().setPendingCount(0);
      return;
    }

    // Initialize pendingCount in Zustand store
    useQueueStore.getState().setPendingCount(pendingRecords.length);

    for (const record of pendingRecords) {
      // If the device went offline mid-sync, abort further sync attempts
      if (!useQueueStore.getState().isOnline) {
        break;
      }

      // Simulate API sync push with network delay
      await new Promise<void>((resolve) => setTimeout(resolve, 500));

      // Upon successful sync push, mark record as SYNCED
      db.runSync(
        "UPDATE sync_queue SET status = 'SYNCED' WHERE id = ?;",
        [record.id]
      );

      // Also if it is a POD completion or status update, update corresponding stop in local DB
      if (record.action_type === 'POD_COMPLETE') {
        db.runSync(
          "UPDATE stops SET status = 'COMPLETED' WHERE id = ?;",
          [record.stop_id]
        );
      }

      // Recalculate remaining pending rows and update queueStore
      const remainingRow = db.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'PENDING';"
      );
      const remaining = remainingRow ? remainingRow.count : 0;
      useQueueStore.getState().setPendingCount(remaining);
    }
  } catch (error) {
    console.error('[SyncManager] Error while flushing sync queue:', error);
  } finally {
    isSyncing = false;
  }
}

/**
 * Helper to enqueue a new offline action into the sync_queue table.
 * If currently online, immediately triggers background sync flush.
 */
export function enqueueSyncItem(
  stopId: string,
  actionType: SyncActionType,
  payload: SyncPayload | string
): SyncQueueRecord {
  const id = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const createdAt = new Date().toISOString();
  const serializedPayload =
    typeof payload === 'string' ? payload : JSON.stringify(payload);

  db.runSync(
    `INSERT INTO sync_queue (id, stop_id, action_type, payload, status, created_at)
     VALUES (?, ?, ?, ?, 'PENDING', ?);`,
    [id, stopId, actionType, serializedPayload, createdAt]
  );

  // Update stop status locally if applicable
  if (actionType === 'POD_COMPLETE') {
    db.runSync(
      "UPDATE stops SET status = 'COMPLETED' WHERE id = ?;",
      [stopId]
    );
  }

  // Recalculate pending count
  const remainingRow = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'PENDING';"
  );
  const remaining = remainingRow ? remainingRow.count : 0;
  useQueueStore.getState().setPendingCount(remaining);

  // If online, immediately invoke flush in background
  if (useQueueStore.getState().isOnline) {
    void flushSyncQueue();
  }

  return {
    id,
    stop_id: stopId,
    action_type: actionType,
    payload: serializedPayload,
    status: 'PENDING',
    created_at: createdAt,
  };
}

/**
 * Helper to fetch all currently pending sync queue records.
 */
export function getPendingRecords(): SyncQueueRecord[] {
  return db.getAllSync<SyncQueueRecord>(
    "SELECT * FROM sync_queue WHERE status = 'PENDING' ORDER BY created_at ASC;"
  );
}

/**
 * Helper to retrieve the current count of pending records directly from SQLite.
 */
export function getPendingCount(): number {
  const countRow = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'PENDING';"
  );
  return countRow ? countRow.count : 0;
}
