import { useMemo } from 'react';

import { useTripStore } from '../store/tripStore';
import { activeStopIndex, tripProgress } from '../utils/stopProgress';

/** Current trip snapshot plus derived progress for screens. */
export function useTrip() {
  const snapshot = useTripStore((s) => s.snapshot);
  const status = useTripStore((s) => s.status);
  const error = useTripStore((s) => s.error);

  return useMemo(() => {
    const trip = snapshot?.trip ?? null;
    const stops = trip?.stops ?? [];
    const activeIndex = activeStopIndex(stops);
    return {
      status,
      error,
      driver: snapshot?.driver ?? null,
      trip,
      stops,
      activeIndex,
      activeStop: activeIndex === -1 ? null : stops[activeIndex],
      progress: tripProgress(stops),
      downloadedAt: snapshot?.downloadedAt ?? null,
    };
  }, [snapshot, status, error]);
}
