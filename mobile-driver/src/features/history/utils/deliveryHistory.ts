import type { OutboxRow } from '@/features/sync/types';
import type { PodPayload } from '@/features/sync/utils/payloads';
import type { TempRequirement, TripStop } from '@/features/trip/types';
import { isStopClosed } from '@/features/trip/utils/stopProgress';

export type HistoryStatus = 'Complete' | 'Shortfall' | 'Failed';
export type HistoryFilter = 'All' | 'Completed' | 'Exceptions';

export interface HistoryItem {
  id: string;
  sequence: number;
  storeName: string;
  address: string | null;
  completedAt: string | null;
  itemsExpected: number;
  /** Known only when the POD was captured on this device. */
  itemsDelivered: number | null;
  weightKg: number;
  temp: TempRequirement;
  status: HistoryStatus;
  /** false while the POD is still waiting in the outbox, null when unknown. */
  synced: boolean | null;
}

/** Latest POD payload captured on this device per stop. */
function podsByStop(outbox: OutboxRow[]) {
  const map = new Map<string, { payload: PodPayload; synced: boolean }>();
  for (const row of outbox) {
    if (row.action_type !== 'POD_COMPLETE' || !row.stop_id) continue;
    try {
      map.set(row.stop_id, { payload: JSON.parse(row.payload) as PodPayload, synced: row.status === 'SYNCED' });
    } catch {
      // ignore unreadable rows
    }
  }
  return map;
}

/** Closed stops of the trip, newest first, enriched with locally captured POD details. */
export function buildHistory(stops: TripStop[], outbox: OutboxRow[]): HistoryItem[] {
  const pods = podsByStop(outbox);
  return stops
    .filter((s) => isStopClosed(s.status))
    .map((s): HistoryItem => {
      const pod = pods.get(s.id);
      const delivered = pod ? pod.payload.itemsDelivered : null;
      const status: HistoryStatus =
        s.status === 'FAILED' || pod?.payload.outcome === 'failed'
          ? 'Failed'
          : pod?.payload.outcome === 'partial'
            ? 'Shortfall'
            : 'Complete';
      return {
        id: s.id,
        sequence: s.sequence,
        storeName: s.storeName,
        address: s.address,
        completedAt: s.completedAt ?? pod?.payload.capturedAt ?? null,
        itemsExpected: s.itemCount,
        itemsDelivered: delivered,
        weightKg: s.weightKg,
        temp: s.temp,
        status,
        synced: pod ? pod.synced : null,
      };
    })
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '') || b.sequence - a.sequence);
}

export function filterHistory(items: HistoryItem[], filter: HistoryFilter): HistoryItem[] {
  if (filter === 'Completed') return items.filter((i) => i.status === 'Complete');
  if (filter === 'Exceptions') return items.filter((i) => i.status !== 'Complete');
  return items;
}

export interface HistorySummary {
  closed: number;
  completed: number;
  exceptions: number;
  successPercent: number;
  itemsDelivered: number;
  weightKg: number;
}

export function summarizeHistory(items: HistoryItem[]): HistorySummary {
  const delivered = items.filter((i) => i.status !== 'Failed');
  const completed = items.filter((i) => i.status === 'Complete').length;
  return {
    closed: items.length,
    completed,
    exceptions: items.length - completed,
    successPercent: items.length === 0 ? 0 : Math.round((completed / items.length) * 100),
    itemsDelivered: delivered.reduce((sum, i) => sum + (i.itemsDelivered ?? i.itemsExpected), 0),
    weightKg: delivered.reduce((sum, i) => sum + i.weightKg, 0),
  };
}

export function itemsLabel(item: HistoryItem): string {
  return item.itemsDelivered === null
    ? `${item.itemsExpected} items`
    : `${item.itemsDelivered}/${item.itemsExpected} items`;
}
