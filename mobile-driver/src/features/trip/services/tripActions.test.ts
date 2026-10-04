import { createMemoryDb } from '@/features/sync/db/memoryDb';
import { enqueue } from '@/features/sync/services/outbox';
import { buildPodPayload } from '@/features/sync/utils/payloads';

import { tripRow } from '../fixtures';
import type { TripSnapshot } from '../types';
import { mockQueryClient } from './mockQuery';
import { completeStop, refreshTrip, startStop, type TripActionDeps } from './tripActions';
import { loadSnapshot, saveSnapshot } from './tripCache';

const profile = { id: 'uid', role: 'driver', full_name: 'Driver', phone: null, employee_id: null, avatar_url: null };

function setup({ isOnline = true, tripsError = null as string | null } = {}) {
  const db = createMemoryDb();
  db.init();
  const { client } = mockQueryClient({
    profiles: { data: profile, error: null },
    trips: tripsError ? { data: null, error: { message: tripsError } } : { data: [tripRow()], error: null },
  });
  const setSnapshot = jest.fn<void, [TripSnapshot | null]>();
  const onQueued = jest.fn();
  const deps: TripActionDeps = { db, client, userId: 'uid', isOnline, setSnapshot, onQueued };
  return { db, deps, setSnapshot, onQueued };
}

describe('refreshTrip', () => {
  it('downloads, caches and publishes the trip with pending actions overlaid', async () => {
    const { db, deps, setSnapshot } = setup();
    enqueue(db, 'STATUS_UPDATE', 'stop-1', { stopId: 'stop-1' });
    const snapshot = await refreshTrip(deps);
    expect(snapshot?.trip?.stops[0].status).toBe('IN_PROGRESS');
    expect(loadSnapshot(db)).toEqual(snapshot);
    expect(setSnapshot).toHaveBeenCalledWith(snapshot);
  });

  it('uses the cached copy offline, but never another driver\'s', async () => {
    const { db, deps, setSnapshot } = setup({ isOnline: false });
    expect(await refreshTrip(deps)).toBeNull();
    const cached: TripSnapshot = { driver: { ...profile, fullName: 'X', employeeId: null, station: null, shift: null, avatarUrl: null }, trip: null, downloadedAt: 'x' };
    saveSnapshot(db, cached);
    expect(await refreshTrip(deps)).toEqual(cached);
    saveSnapshot(db, { ...cached, driver: { ...cached.driver, id: 'someone-else' } });
    expect(await refreshTrip(deps)).toBeNull();
    expect(setSnapshot).toHaveBeenLastCalledWith(null);
  });

  it('falls back to the cache when the download fails, else throws', async () => {
    const { db, deps } = setup({ tripsError: 'timeout' });
    await expect(refreshTrip(deps)).rejects.toThrow('timeout');
    const cached: TripSnapshot = { driver: { id: 'uid', fullName: null, phone: null, employeeId: null, station: null, shift: null, avatarUrl: null }, trip: null, downloadedAt: 'x' };
    saveSnapshot(db, cached);
    await expect(refreshTrip(deps)).resolves.toEqual(cached);
  });
});

describe('stop actions', () => {
  it('starts a pending stop once and queues driver_start_stop', async () => {
    const { db, deps, onQueued } = setup();
    await refreshTrip(deps);
    startStop(deps, 'stop-1');
    startStop(deps, 'stop-1');
    startStop(deps, 'unknown');
    expect(db.listOutbox()).toHaveLength(1);
    expect(db.listOutbox()[0]).toMatchObject({ action_type: 'STATUS_UPDATE', stop_id: 'stop-1' });
    expect(loadSnapshot(db)?.trip?.stops[0].status).toBe('IN_PROGRESS');
    expect(onQueued).toHaveBeenCalledTimes(1);
  });

  it('completes a stop locally and queues the POD', async () => {
    const { db, deps, setSnapshot } = setup();
    await refreshTrip(deps);
    const payload = buildPodPayload({ stopId: 'stop-2', itemsExpected: 28, itemsDelivered: 20, notes: 'short', signaturePng: 'x', isOnline: true });
    completeStop(deps, payload);
    expect(db.listOutbox()[0]).toMatchObject({ action_type: 'POD_COMPLETE', stop_id: 'stop-2' });
    expect(loadSnapshot(db)?.trip?.stops[1]).toMatchObject({ status: 'COMPLETED', completedAt: payload.capturedAt });
    expect(setSnapshot).toHaveBeenLastCalledWith(loadSnapshot(db));

    const failed = buildPodPayload({ stopId: 'stop-1', itemsExpected: 28, itemsDelivered: 0, notes: 'closed', isOnline: true });
    completeStop(deps, failed);
    expect(loadSnapshot(db)?.trip?.stops[0].status).toBe('FAILED');
  });
});
