import {
  db,
  type SyncActionType,
  type SyncPayload,
  type SyncQueueRecord,
} from '@/database/schema';
import { supabase } from '@/lib/supabaseClient';
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

      // Hit Supabase based on the action type
      if (record.action_type === 'STATUS_UPDATE') {
        const payload = JSON.parse(record.payload);
        const { error } = await supabase
          .from('trip_stops')
          .update({ status: payload.status })
          .eq('id', record.stop_id);
          
        if (error) {
          console.error('[SyncManager] Supabase update failed:', error);
          // Stop processing queue if Supabase fails (e.g. network issue despite isOnline)
          break;
        }
      } else if (record.action_type === 'POD_COMPLETE') {
        // Also update trip_stops to completed
        const { error } = await supabase
          .from('trip_stops')
          .update({ status: 'COMPLETED' })
          .eq('id', record.stop_id);
          
        if (error) {
          console.error('[SyncManager] Supabase POD complete failed:', error);
          break;
        }
        
        // Update local status as well
        db.runSync(
          "UPDATE stops SET status = 'COMPLETED' WHERE id = ?;",
          [record.stop_id]
        );
      }

      // Upon successful sync push, mark record as SYNCED locally
      db.runSync(
        "UPDATE sync_queue SET status = 'SYNCED' WHERE id = ?;",
        [record.id]
      );

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

/**
 * Downloads store managers and trip stops from Supabase and populates the local SQLite DB.
 * This represents the "Downward Sync" at the start of a shift.
 */
export async function downloadTripData(): Promise<void> {
  if (!useQueueStore.getState().isOnline) {
    console.warn('[SyncManager] Cannot download trip data while offline.');
    return;
  }

  try {
    // 1. Fetch store managers
    const { data: managers, error: mgrError } = await supabase
      .from('store_managers')
      .select('*');
      
    if (mgrError) throw mgrError;

    // 2. Fetch trip stops
    const { data: stops, error: stopsError } = await supabase
      .from('trip_stops')
      .select('*');
      
    if (stopsError) throw stopsError;

    // 3. Clear local tables (for simplicity during shift start)
    db.execSync('DELETE FROM stops;');
    db.execSync('DELETE FROM store_managers;');

    // 4. Insert managers locally
    if (managers && managers.length > 0) {
      const insertManager = db.prepareSync(
        'INSERT INTO store_managers (id, name, phone) VALUES (?, ?, ?);'
      );
      try {
        for (const mgr of managers) {
          insertManager.executeSync([mgr.id, mgr.name, mgr.phone]);
        }
      } finally {
        insertManager.finalizeSync();
      }
    }

    // 5. Insert stops locally
    if (stops && stops.length > 0) {
      const insertStop = db.prepareSync(`
        INSERT INTO stops (
          id, stop_number, store_name, address, window,
          is_chilled, items_count, weight_kg, volume_m3,
          access_notes, latitude, longitude, status, manager_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);

      try {
        for (const stop of stops) {
          insertStop.executeSync([
            stop.id,
            stop.stop_number,
            stop.store_name,
            stop.address,
            stop.window,
            stop.is_chilled ? 1 : 0, // Convert boolean from Supabase to SQLite INTEGER
            stop.items_count,
            stop.weight_kg,
            stop.volume_m3,
            stop.access_notes ?? '',
            stop.latitude ?? null,
            stop.longitude ?? null,
            stop.status || 'PENDING',
            stop.manager_id ?? null,
          ]);
        }
      } finally {
        insertStop.finalizeSync();
      }
    }

    console.log('[SyncManager] Successfully downloaded trip data from Supabase!');
  } catch (error) {
    console.error('[SyncManager] Error downloading trip data:', error);
  }
}
