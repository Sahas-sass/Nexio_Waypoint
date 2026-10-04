import type { OutboxRow } from '@/features/sync/types';
import type { TripStop } from '@/features/trip/types';

import { buildHistory, filterHistory, itemsLabel, summarizeHistory } from './deliveryHistory';

const stop = (id: string, sequence: number, status: TripStop['status'], completedAt: string | null = null): TripStop => ({
  id,
  sequence,
  status,
  estimatedArrival: null,
  completedAt,
  orderId: null,
  orderNumber: null,
  itemCount: 10,
  weightKg: 100,
  volumeM3: 1,
  temp: 'chilled',
  window: null,
  storeId: 'st',
  storeName: `Store ${sequence}`,
  address: null,
  accessConditions: null,
  isVanOnly: false,
  latitude: null,
  longitude: null,
  managerName: null,
  managerPhone: null,
});

const pod = (stopId: string, outcome: string, delivered: number, status: OutboxRow['status'] = 'PENDING'): OutboxRow => ({
  id: `ob-${stopId}`,
  stop_id: stopId,
  action_type: 'POD_COMPLETE',
  payload: JSON.stringify({ stopId, outcome, itemsDelivered: delivered, itemsExpected: 10, capturedAt: '2026-10-04T05:00:00.000Z' }),
  status,
  attempts: 0,
  last_error: null,
  created_at: '2026-10-04T05:00:00.000Z',
  synced_at: null,
});

describe('buildHistory', () => {
  const stops = [
    stop('a', 1, 'COMPLETED', '2026-10-04T02:00:00.000Z'),
    stop('b', 2, 'COMPLETED'),
    stop('c', 3, 'FAILED', '2026-10-04T03:00:00.000Z'),
    stop('d', 4, 'PENDING'),
  ];
  const outbox = [pod('b', 'partial', 7), { ...pod('x', 'delivered', 1), action_type: 'STATUS_UPDATE' as const }];

  it('lists closed stops newest first with local POD details', () => {
    const items = buildHistory(stops, outbox);
    expect(items.map((i) => i.id)).toEqual(['b', 'c', 'a']);
    expect(items[0]).toMatchObject({ status: 'Shortfall', itemsDelivered: 7, synced: false, completedAt: '2026-10-04T05:00:00.000Z' });
    expect(items[1]).toMatchObject({ status: 'Failed', itemsDelivered: null, synced: null });
    expect(items[2]).toMatchObject({ status: 'Complete' });
  });

  it('filters and summarises', () => {
    const items = buildHistory(stops, outbox);
    expect(filterHistory(items, 'All')).toHaveLength(3);
    expect(filterHistory(items, 'Completed').map((i) => i.id)).toEqual(['a']);
    expect(filterHistory(items, 'Exceptions').map((i) => i.id)).toEqual(['b', 'c']);
    expect(summarizeHistory(items)).toEqual({
      closed: 3,
      completed: 1,
      exceptions: 2,
      successPercent: 33,
      itemsDelivered: 17,
      weightKg: 200,
    });
  });

  it('handles an empty trip and corrupt payloads', () => {
    expect(summarizeHistory([])).toMatchObject({ closed: 0, successPercent: 0 });
    const broken = { ...pod('a', 'delivered', 10, 'SYNCED'), payload: '{bad' };
    expect(buildHistory([stop('a', 1, 'COMPLETED')], [broken])[0].itemsDelivered).toBeNull();
  });

  it('labels item counts', () => {
    const [item] = buildHistory([stop('a', 1, 'COMPLETED')], [pod('a', 'delivered', 10, 'SYNCED')]);
    expect(item.synced).toBe(true);
    expect(itemsLabel(item)).toBe('10/10 items');
    expect(itemsLabel({ ...item, itemsDelivered: null })).toBe('10 items');
  });
});
