import { createMemoryDb } from '../db/memoryDb';
import { buildPodPayload } from '../utils/payloads';
import { flushOutbox, type SyncClient } from './flushOutbox';
import { enqueue } from './outbox';

function mockClient(overrides: { rpcError?: (fn: string) => string | null; uploadError?: () => { message: string; statusCode?: string } | null } = {}) {
  const rpc = jest.fn((fn: string) =>
    Promise.resolve({ error: overrides.rpcError?.(fn) ? { message: overrides.rpcError(fn)! } : null })
  );
  const upload = jest.fn(() => Promise.resolve({ error: overrides.uploadError?.() ?? null }));
  const from = jest.fn(() => ({ upload }));
  const client: SyncClient = { rpc, storage: { from } };
  return { client, rpc, upload, from };
}

function setup() {
  const db = createMemoryDb();
  db.init();
  return db;
}

const pod = (overrides = {}) =>
  buildPodPayload({
    stopId: 'stop-1',
    itemsExpected: 4,
    itemsDelivered: 4,
    signaturePng: 'aGVsbG8=',
    photo: { base64: 'TWFu', mimeType: 'image/jpeg' },
    isOnline: false,
    capturedAt: new Date('2026-10-04T03:00:00Z'),
    ...overrides,
  });

describe('flushOutbox', () => {
  it('calls driver_start_stop for status updates', async () => {
    const db = setup();
    enqueue(db, 'STATUS_UPDATE', 'stop-1', { stopId: 'stop-1' });
    const { client, rpc } = mockClient();
    const result = await flushOutbox({ db, client, userId: 'uid' });
    expect(rpc).toHaveBeenCalledWith('driver_start_stop', { p_stop_id: 'stop-1' });
    expect(result).toEqual({ synced: 1, failed: 0, completedStops: [] });
    expect(db.listOutbox()[0].status).toBe('SYNCED');
  });

  it('calls driver_update_location for GPS rows', async () => {
    const db = setup();
    enqueue(db, 'LOCATION_UPDATE', null, { tripId: 't1', lat: 6.9, lng: 79.8, recordedAt: 'x' });
    const { client, rpc } = mockClient();
    await flushOutbox({ db, client, userId: 'uid' });
    expect(rpc).toHaveBeenCalledWith('driver_update_location', { p_trip_id: 't1', p_lat: 6.9, p_lng: 79.8 });
  });

  it('uploads evidence to the driver folder then submits the POD', async () => {
    const db = setup();
    enqueue(db, 'POD_COMPLETE', 'stop-1', pod());
    const { client, rpc, upload, from } = mockClient();
    const result = await flushOutbox({ db, client, userId: 'uid' });

    expect(from).toHaveBeenCalledWith('pod-evidence');
    expect(upload).toHaveBeenCalledWith('uid/stop-1/photo.jpg', expect.any(Uint8Array), { contentType: 'image/jpeg', upsert: false });
    expect(upload).toHaveBeenCalledWith('uid/stop-1/signature.png', expect.any(Uint8Array), { contentType: 'image/png', upsert: false });
    expect(rpc).toHaveBeenCalledWith('submit_proof_of_delivery', expect.objectContaining({
      p_stop_id: 'stop-1',
      p_outcome: 'delivered',
      p_photo_url: 'uid/stop-1/photo.jpg',
      p_signature_url: 'uid/stop-1/signature.png',
      p_captured_offline: true,
      p_captured_at: '2026-10-04T03:00:00.000Z',
    }));
    expect(result.completedStops).toEqual(['stop-1']);
  });

  it('treats an "already exists" upload as success (retry after partial sync)', async () => {
    const db = setup();
    enqueue(db, 'POD_COMPLETE', 'stop-1', pod());
    const { client, rpc } = mockClient({ uploadError: () => ({ message: 'The resource already exists', statusCode: '409' }) });
    const result = await flushOutbox({ db, client, userId: 'uid' });
    expect(result.synced).toBe(1);
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it('keeps uploaded paths so a retry does not upload again', async () => {
    const db = setup();
    enqueue(db, 'POD_COMPLETE', 'stop-1', pod());
    const first = mockClient({ rpcError: () => 'network down' });
    const failed = await flushOutbox({ db, client: first.client, userId: 'uid' });
    expect(failed.failed).toBe(1);
    expect(db.listOutbox()[0]).toMatchObject({ status: 'PENDING', attempts: 1, last_error: 'network down' });

    const second = mockClient();
    await flushOutbox({ db, client: second.client, userId: 'uid' });
    expect(second.upload).not.toHaveBeenCalled();
    expect(db.listOutbox()[0].status).toBe('SYNCED');
  });

  it('records real upload errors and blocks later rows for the same stop only', async () => {
    const db = setup();
    enqueue(db, 'POD_COMPLETE', 'stop-1', pod(), new Date('2026-01-01'));
    enqueue(db, 'STATUS_UPDATE', 'stop-1', { stopId: 'stop-1' }, new Date('2026-01-02'));
    enqueue(db, 'STATUS_UPDATE', 'stop-2', { stopId: 'stop-2' }, new Date('2026-01-03'));
    const { client, rpc } = mockClient({ uploadError: () => ({ message: 'Payload too large' }) });
    const result = await flushOutbox({ db, client, userId: 'uid' });
    expect(result).toEqual({ synced: 1, failed: 1, completedStops: [] });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('driver_start_stop', { p_stop_id: 'stop-2' });
    expect(db.listOutbox()[0].last_error).toBe('Upload failed: Payload too large');
  });

  it('skips rows that are already synced and PODs without evidence', async () => {
    const db = setup();
    const row = enqueue(db, 'STATUS_UPDATE', 'stop-1', { stopId: 'stop-1' });
    db.markSynced(row.id, 'x');
    enqueue(db, 'POD_COMPLETE', 'stop-2', pod({ stopId: 'stop-2', photo: null, signaturePng: null, failed: true, notes: 'Closed' }));
    const { client, rpc, upload } = mockClient();
    await flushOutbox({ db, client, userId: 'uid' });
    expect(upload).not.toHaveBeenCalled();
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('submit_proof_of_delivery', expect.objectContaining({ p_outcome: 'failed', p_photo_url: null }));
  });
});
