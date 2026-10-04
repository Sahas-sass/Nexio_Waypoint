import type { OutboxRow } from '@/features/sync/types';
import type { PodPayload } from '@/features/sync/utils/payloads';

import type { Trip } from '../types';
import { withStopStatus } from './stopProgress';

/**
 * Overlay actions that are still waiting in the outbox on top of a trip
 * downloaded from the server, so the driver never sees a delivered stop
 * "come back" before its POD has synced.
 */
export function applyPendingActions(trip: Trip | null, outbox: OutboxRow[]): Trip | null {
  if (!trip) return trip;
  let stops = trip.stops;
  for (const row of outbox) {
    if (row.status !== 'PENDING' || !row.stop_id) continue;
    const stop = stops.find((s) => s.id === row.stop_id);
    if (!stop) continue;
    if (row.action_type === 'STATUS_UPDATE' && stop.status === 'PENDING') {
      stops = withStopStatus(stops, stop.id, 'IN_PROGRESS');
    } else if (row.action_type === 'POD_COMPLETE') {
      const payload = JSON.parse(row.payload) as PodPayload;
      stops = withStopStatus(stops, stop.id, payload.outcome === 'failed' ? 'FAILED' : 'COMPLETED', payload.capturedAt);
    }
  }
  return stops === trip.stops ? trip : { ...trip, stops };
}
