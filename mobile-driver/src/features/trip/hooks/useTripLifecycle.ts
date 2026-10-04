import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { locationService } from '@/features/location/locationService';

import { reloadTrip, syncAndReload } from '../services/tripController';
import { useTripStore } from '../store/tripStore';

/** After sign-in: load the trip, flush queued work and track GPS while a trip is active. */
export function useTripLifecycle() {
  const userId = useAuthStore((s) => s.userId);
  const tripId = useTripStore((s) => s.snapshot?.trip?.id ?? null);

  useEffect(() => {
    if (!userId) return;
    void reloadTrip().then(() => syncAndReload());
  }, [userId]);

  useEffect(() => {
    if (!userId || !tripId) return;
    locationService.start(tripId).catch((error) => console.warn('[location] tracking unavailable', error));
    return () => locationService.stop();
  }, [userId, tripId]);
}
