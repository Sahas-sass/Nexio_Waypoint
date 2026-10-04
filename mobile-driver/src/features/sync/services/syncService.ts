import { useAuthStore } from '@/features/auth/store/authStore';
import { supabase } from '@/lib/supabaseClient';

import { localDb } from '../db/localDb';
import { useSyncStore } from '../store/syncStore';
import { enqueue } from './outbox';
import { flushOutbox, type FlushResult, type SyncClient } from './flushOutbox';
import type { SyncActionType } from '../types';

/** App-wide wiring of the outbox: real SQLite db, Supabase client and stores. */

let running: Promise<FlushResult | null> | null = null;

export function refreshOutboxState() {
  useSyncStore.getState().setOutbox(localDb.listOutbox());
}

/** Flush the outbox once (concurrent callers share the same run). */
export function syncNow(onCompleted?: (result: FlushResult) => void): Promise<FlushResult | null> {
  const userId = useAuthStore.getState().userId;
  if (!userId || !useSyncStore.getState().isOnline) return Promise.resolve(null);
  if (running) return running;

  const store = useSyncStore.getState();
  store.setSyncing(true);
  running = flushOutbox({ db: localDb, client: supabase as unknown as SyncClient, userId })
    .then((result) => {
      if (result.synced > 0) useSyncStore.getState().setLastSyncedAt(new Date().toISOString());
      onCompleted?.(result);
      return result;
    })
    .finally(() => {
      useSyncStore.getState().setSyncing(false);
      refreshOutboxState();
      running = null;
    });
  return running;
}

export function queueAndSync(type: SyncActionType, stopId: string | null, payload: unknown) {
  enqueue(localDb, type, stopId, payload);
  refreshOutboxState();
  void syncNow();
}
