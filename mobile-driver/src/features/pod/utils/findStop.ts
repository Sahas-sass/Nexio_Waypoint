import type { TripStop } from '@/features/trip/types';

/** The stop named in the route params, else the active stop, else null. */
export function findStop(stops: TripStop[], stopId: string | string[] | undefined, active: TripStop | null): TripStop | null {
  const id = Array.isArray(stopId) ? stopId[0] : stopId;
  if (id) {
    const match = stops.find((s) => s.id === id);
    if (match) return match;
  }
  return active;
}

/** First open stop after the given one in sequence (for the "up next" card). */
export function nextOpenStop(stops: TripStop[], afterId: string | null): TripStop | null {
  const open = stops.filter((s) => s.id !== afterId && (s.status === 'PENDING' || s.status === 'IN_PROGRESS'));
  return open[0] ?? null;
}
