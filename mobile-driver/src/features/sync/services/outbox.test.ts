import { createMemoryDb } from '../db/memoryDb';
import { enqueue, newOutboxId, pendingRows, visiblePendingCount } from './outbox';

describe('outbox', () => {
  it('generates unique ids', () => {
    const now = new Date();
    expect(newOutboxId(now)).not.toBe(newOutboxId(now));
  });

  it('enqueues serialised pending rows', () => {
    const db = createMemoryDb();
    db.init();
    const now = new Date('2026-10-04T00:00:00.000Z');
    const row = enqueue(db, 'STATUS_UPDATE', 's1', { stopId: 's1' }, now);
    expect(row).toMatchObject({ stop_id: 's1', status: 'PENDING', attempts: 0, created_at: now.toISOString() });
    expect(JSON.parse(row.payload)).toEqual({ stopId: 's1' });
    expect(pendingRows(db)).toHaveLength(1);
    db.markSynced(row.id, now.toISOString());
    expect(pendingRows(db)).toHaveLength(0);
  });

  it('counts only driver-visible pending rows', () => {
    const db = createMemoryDb();
    db.init();
    enqueue(db, 'LOCATION_UPDATE', null, {});
    enqueue(db, 'POD_COMPLETE', 's1', {});
    expect(visiblePendingCount(db.listOutbox())).toBe(1);
  });
});
