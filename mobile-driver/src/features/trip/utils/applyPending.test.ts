import { enqueue } from '@/features/sync/services/outbox';
import { createMemoryDb } from '@/features/sync/db/memoryDb';
import { buildPodPayload } from '@/features/sync/utils/payloads';

import { trip, tripStop } from '../fixtures';
import { applyPendingActions } from './applyPending';

function outbox() {
  const db = createMemoryDb();
  db.init();
  return db;
}

describe('applyPendingActions', () => {
  const base = trip([tripStop({ id: 'a' }), tripStop({ id: 'b', sequence: 2 }), tripStop({ id: 'c', sequence: 3 })]);

  it('returns the same trip when nothing is pending', () => {
    expect(applyPendingActions(base, [])).toBe(base);
    expect(applyPendingActions(null, [])).toBeNull();
  });

  it('overlays queued starts and PODs', () => {
    const db = outbox();
    enqueue(db, 'STATUS_UPDATE', 'a', { stopId: 'a' });
    enqueue(db, 'POD_COMPLETE', 'b', buildPodPayload({ stopId: 'b', itemsExpected: 10, itemsDelivered: 10, signaturePng: 'x', isOnline: false, capturedAt: new Date('2026-10-04T03:00:00Z') }));
    enqueue(db, 'POD_COMPLETE', 'c', buildPodPayload({ stopId: 'c', itemsExpected: 10, itemsDelivered: 0, notes: 'closed', isOnline: false }));
    enqueue(db, 'STATUS_UPDATE', 'zzz', { stopId: 'zzz' });
    enqueue(db, 'LOCATION_UPDATE', null, {});
    const result = applyPendingActions(base, db.listOutbox())!;
    expect(result.stops.map((s) => s.status)).toEqual(['IN_PROGRESS', 'COMPLETED', 'FAILED']);
    expect(result.stops[1].completedAt).toBe('2026-10-04T03:00:00.000Z');
  });

  it('ignores synced rows', () => {
    const db = outbox();
    const row = enqueue(db, 'STATUS_UPDATE', 'a', { stopId: 'a' });
    db.markSynced(row.id, 'x');
    expect(applyPendingActions(base, db.listOutbox())).toBe(base);
  });
});
