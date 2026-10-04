import type { OutboxRow } from '../types';
import { outboxItems } from './outboxView';

const row = (over: Partial<OutboxRow>): OutboxRow => ({
  id: 'r',
  stop_id: null,
  action_type: 'STATUS_UPDATE',
  payload: '{}',
  status: 'PENDING',
  attempts: 0,
  last_error: null,
  created_at: '2026-10-04T03:00:00.000Z',
  synced_at: null,
  ...over,
});

describe('outboxItems', () => {
  it('labels pending rows with the stop, newest first, and folds GPS pings', () => {
    const items = outboxItems(
      [
        row({ id: 'a', stop_id: 's1', action_type: 'STATUS_UPDATE' }),
        row({ id: 'b', stop_id: 's1', action_type: 'POD_COMPLETE', last_error: 'offline' }),
        row({ id: 'c', action_type: 'LOCATION_UPDATE' }),
        row({ id: 'd', action_type: 'LOCATION_UPDATE' }),
        row({ id: 'e', stop_id: 's2', status: 'SYNCED' }),
      ],
      (id) => (id === 's1' ? 'Stop 01' : null)
    );
    expect(items.map((i) => i.title)).toEqual(['2 GPS positions', 'Stop 01 · Proof of delivery', 'Stop 01 · Stop started']);
    expect(items[1].error).toBe('offline');
    expect(items[1].time).toMatch(/AM|PM/);
  });

  it('falls back to the action label when the stop is unknown', () => {
    expect(outboxItems([row({ stop_id: 'x' })], () => null)[0].title).toBe('Stop started');
  });

  it('is empty when nothing is pending', () => {
    expect(outboxItems([], () => null)).toEqual([]);
  });
});
