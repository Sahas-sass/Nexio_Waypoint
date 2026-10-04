import type { OutboxRow } from '@/features/sync/types';

import { clampItems, latestPodRow, podPayload, podSyncState } from './podResult';

const row = (over: Partial<OutboxRow>): OutboxRow => ({
  id: 'r',
  stop_id: 's1',
  action_type: 'POD_COMPLETE',
  payload: '{"itemsDelivered":3}',
  status: 'PENDING',
  attempts: 0,
  last_error: null,
  created_at: '2026',
  synced_at: null,
  ...over,
});

describe('podResult', () => {
  it('finds the latest POD row for a stop', () => {
    const rows = [row({ id: '1' }), row({ id: '2', action_type: 'STATUS_UPDATE' }), row({ id: '3' }), row({ id: '4', stop_id: 's2' })];
    expect(latestPodRow(rows, 's1')?.id).toBe('3');
    expect(latestPodRow(rows, 'none')).toBeNull();
  });

  it('derives the sync state', () => {
    expect(podSyncState(null)).toBe('none');
    expect(podSyncState(row({ status: 'SYNCED' }))).toBe('synced');
    expect(podSyncState(row({}))).toBe('queued');
    expect(podSyncState(row({ last_error: 'x' }))).toBe('retrying');
  });

  it('parses the payload safely', () => {
    expect(podPayload(row({}))?.itemsDelivered).toBe(3);
    expect(podPayload(row({ payload: '{bad' }))).toBeNull();
    expect(podPayload(null)).toBeNull();
  });

  it('clamps item counts', () => {
    expect(clampItems(5, 4)).toBe(4);
    expect(clampItems(-1, 4)).toBe(0);
    expect(clampItems(2.6, 4)).toBe(3);
    expect(clampItems(Number.NaN, 4)).toBe(0);
  });
});
