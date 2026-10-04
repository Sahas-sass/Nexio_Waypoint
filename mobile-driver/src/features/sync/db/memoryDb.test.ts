import type { OutboxRow } from '../types';
import { createMemoryDb, type KeyValueBackend } from './memoryDb';

const row = (id: string, created_at: string): OutboxRow => ({
  id,
  stop_id: 's1',
  action_type: 'STATUS_UPDATE',
  payload: '{}',
  status: 'PENDING',
  attempts: 0,
  last_error: null,
  created_at,
  synced_at: null,
});

function fakeStorage(): KeyValueBackend & { data: Record<string, string> } {
  const data: Record<string, string> = {};
  return {
    data,
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

describe('createMemoryDb', () => {
  it('stores and returns cached values', () => {
    const db = createMemoryDb();
    db.init();
    expect(db.getCache('x')).toBeNull();
    db.setCache('x', { a: 1 });
    expect(db.getCache('x')).toEqual({ a: 1 });
  });

  it('lists the outbox oldest first and tracks sync state', () => {
    const db = createMemoryDb();
    db.init();
    db.insertOutbox(row('b', '2026-01-02'));
    db.insertOutbox(row('a', '2026-01-01'));
    expect(db.listOutbox().map((r) => r.id)).toEqual(['a', 'b']);

    db.markFailed('a', 'boom');
    db.markFailed('a', 'boom again');
    expect(db.listOutbox()[0]).toMatchObject({ attempts: 2, last_error: 'boom again' });

    db.updatePayload('a', '{"x":1}');
    db.markSynced('a', '2026-01-03');
    expect(db.listOutbox()[0]).toMatchObject({ status: 'SYNCED', last_error: null, payload: '{"x":1}' });
  });

  it('persists to and restores from the backend, and clears it', () => {
    const storage = fakeStorage();
    const first = createMemoryDb(storage);
    first.init();
    first.setCache('k', 1);
    first.insertOutbox(row('a', '2026-01-01'));

    const second = createMemoryDb(storage);
    second.init();
    expect(second.getCache('k')).toBe(1);
    expect(second.listOutbox()).toHaveLength(1);

    second.clearAll();
    expect(second.listOutbox()).toHaveLength(0);
    expect(storage.data).toEqual({});
  });

  it('survives a corrupt backend value', () => {
    const storage = fakeStorage();
    storage.data['waypoint.cache'] = '{not json';
    const db = createMemoryDb(storage);
    db.init();
    expect(db.getCache('k')).toBeNull();
  });
});
