import { useEffect } from 'react';

import { localDb } from '@/features/sync/db/localDb';
import { refreshOutboxState } from '@/features/sync/services/syncService';
import { supabase } from '@/lib/supabaseClient';

import { NOT_A_DRIVER_MESSAGE, requireDriver } from '../services/authService';
import { clearLocalSession } from '../services/session';
import { useAuthStore } from '../store/authStore';

/**
 * Restore the persisted Supabase session on launch. Online, the profile is
 * re-checked so only drivers keep a session; offline the cached session is
 * trusted so deliveries can continue without signal.
 */
export function useAuthBootstrap() {
  useEffect(() => {
    localDb.init();
    refreshOutboxState();

    let cancelled = false;
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (cancelled) return;
      if (!user) {
        useAuthStore.getState().setSignedOut();
        return;
      }
      try {
        await requireDriver(supabase, user.id);
      } catch (error) {
        if (error instanceof Error && error.message === NOT_A_DRIVER_MESSAGE) {
          clearLocalSession(NOT_A_DRIVER_MESSAGE);
          return;
        }
        // network failure: keep the offline session
      }
      if (!cancelled) useAuthStore.getState().setSignedIn(user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && useAuthStore.getState().status === 'signedIn') clearLocalSession();
    });
    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);
}
