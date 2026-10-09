import { locationService } from '@/features/location/locationService';
import { useLocationStore } from '@/features/location/locationStore';
import { localDb } from '@/features/sync/db/localDb';
import { useSyncStore } from '@/features/sync/store/syncStore';
import { useTripStore } from '@/features/trip/store/tripStore';
import { supabase } from '@/lib/supabaseClient';

import { useAuthStore } from '../store/authStore';

/** Forget everything about the previous driver on this device. */
export function clearLocalSession(notice: string | null = null) {
  locationService.stop();
  localDb.clearAll();
  useTripStore.getState().reset();
  useSyncStore.getState().reset();
  useLocationStore.getState().setLocation(null);
  useAuthStore.getState().setSignedOut(notice);
}

/** Sign out of Supabase and wipe the offline copy (unsynced work is lost – callers confirm first). */
export async function signOut() {
  await supabase.auth.signOut().catch(() => undefined);
  clearLocalSession();
}
