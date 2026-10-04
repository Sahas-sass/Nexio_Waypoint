import { formatTimestamp } from '@/utils/formatters';

import type { OutboxRow } from '../types';
import { actionLabel } from './payloads';

export interface OutboxItemView {
  id: string;
  title: string;
  time: string | null;
  error: string | null;
}

/**
 * Pending rows for the sync screen, newest first. GPS pings are folded into a
 * single line so they don't drown out deliveries.
 */
export function outboxItems(rows: OutboxRow[], stopLabel: (stopId: string) => string | null): OutboxItemView[] {
  const pending = rows.filter((r) => r.status === 'PENDING');
  const gps = pending.filter((r) => r.action_type === 'LOCATION_UPDATE');
  const items: OutboxItemView[] = pending
    .filter((r) => r.action_type !== 'LOCATION_UPDATE')
    .map((r) => {
      const stop = r.stop_id ? stopLabel(r.stop_id) : null;
      return {
        id: r.id,
        title: stop ? `${stop} · ${actionLabel(r.action_type)}` : actionLabel(r.action_type),
        time: formatTimestamp(r.created_at),
        error: r.last_error,
      };
    });
  if (gps.length > 0) {
    const last = gps[gps.length - 1];
    items.push({
      id: 'gps',
      title: `${gps.length} GPS position${gps.length === 1 ? '' : 's'}`,
      time: formatTimestamp(last.created_at),
      error: last.last_error,
    });
  }
  return items.reverse();
}
