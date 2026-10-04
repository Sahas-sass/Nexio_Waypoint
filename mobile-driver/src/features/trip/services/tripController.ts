import { useAuthStore } from '@/features/auth/store/authStore';
import { localDb } from '@/features/sync/db/localDb';
import { refreshOutboxState, syncNow } from '@/features/sync/services/syncService';
import { useSyncStore } from '@/features/sync/store/syncStore';
import type { PodPayload } from '@/features/sync/utils/payloads';
import { supabase } from '@/lib/supabaseClient';

import { useTripStore } from '../store/tripStore';
import { completeStop, refreshTrip, startStop, type TripActionDeps } from './tripActions';

/** Screen-facing trip actions bound to the real db, Supabase client and stores. */

function deps(): TripActionDeps | null {
  const userId = useAuthStore.getState().userId;
  if (!userId) return null;
  return {
    db: localDb,
    client: supabase,
    userId,
    isOnline: useSyncStore.getState().isOnline,
    setSnapshot: useTripStore.getState().setSnapshot,
    onQueued: () => {
      refreshOutboxState();
      void syncAndReload();
    },
  };
}

/** Push queued actions, then re-download the trip if a POD was accepted. */
export function syncAndReload() {
  return syncNow((result) => {
    if (result.completedStops.length > 0) void reloadTrip();
  });
}

export async function reloadTrip() {
  const d = deps();
  if (!d) return;
  const store = useTripStore.getState();
  if (!store.snapshot) store.setLoading();
  try {
    await refreshTrip(d);
  } catch (error) {
    useTripStore.getState().setError(error instanceof Error ? error.message : 'Could not load your trip.');
  }
}

export function startCurrentStop(stopId: string) {
  const d = deps();
  if (d) startStop(d, stopId);
}

export function submitProofOfDelivery(payload: PodPayload) {
  const d = deps();
  if (!d) throw new Error('You are signed out. Sign in again to submit this delivery.');
  completeStop(d, payload);
}
