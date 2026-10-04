import {
  actionLabel,
  buildPodPayload,
  locationRpcArgs,
  podOutcome,
  podRpcArgs,
  podStoragePaths,
  stripDataUrl,
} from './payloads';

const base = {
  stopId: 'stop-1',
  itemsExpected: 10,
  itemsDelivered: 10,
  signaturePng: 'iVBOR',
  isOnline: true,
  capturedAt: new Date('2026-10-04T03:00:00.000Z'),
};

describe('podOutcome', () => {
  it('derives the outcome from counts', () => {
    expect(podOutcome(10, 10)).toBe('delivered');
    expect(podOutcome(10, 7)).toBe('partial');
    expect(podOutcome(10, 0)).toBe('failed');
    expect(podOutcome(10, 10, true)).toBe('failed');
  });
});

describe('buildPodPayload', () => {
  it('builds a full delivery payload', () => {
    expect(buildPodPayload({ ...base, notes: '  ok  ', photo: { base64: 'abc', mimeType: 'image/heic' } })).toEqual({
      stopId: 'stop-1',
      outcome: 'delivered',
      itemsExpected: 10,
      itemsDelivered: 10,
      notes: 'ok',
      capturedOffline: false,
      capturedAt: '2026-10-04T03:00:00.000Z',
      photo: { base64: 'abc', mimeType: 'image/jpeg' },
      signaturePng: 'iVBOR',
      photoPath: null,
      signaturePath: null,
    });
  });

  it('marks offline captures', () => {
    expect(buildPodPayload({ ...base, isOnline: false }).capturedOffline).toBe(true);
  });

  it('rejects out-of-range counts', () => {
    expect(() => buildPodPayload({ ...base, itemsDelivered: 11 })).toThrow('between 0 and 10');
    expect(() => buildPodPayload({ ...base, itemsDelivered: -1 })).toThrow();
    expect(() => buildPodPayload({ ...base, itemsDelivered: 1.5 })).toThrow();
    expect(() => buildPodPayload({ ...base, itemsExpected: -2 })).toThrow('Expected');
    expect(() => buildPodPayload({ ...base, stopId: '' })).toThrow('Missing stop');
  });

  it('requires a note for partial / failed deliveries', () => {
    expect(() => buildPodPayload({ ...base, itemsDelivered: 5 })).toThrow('note');
    expect(buildPodPayload({ ...base, itemsDelivered: 5, notes: '2 crates damaged' }).outcome).toBe('partial');
  });

  it('requires a signature unless the delivery failed', () => {
    expect(() => buildPodPayload({ ...base, signaturePng: null })).toThrow('signature');
    const failed = buildPodPayload({ ...base, signaturePng: null, failed: true, notes: 'Store closed' });
    expect(failed.outcome).toBe('failed');
    expect(failed.signaturePng).toBeNull();
  });

  it('truncates long notes', () => {
    expect(buildPodPayload({ ...base, notes: 'x'.repeat(900) }).notes).toHaveLength(500);
  });
});

describe('rpc arg builders', () => {
  it('maps POD payload to submit_proof_of_delivery args', () => {
    const payload = { ...buildPodPayload(base), photoPath: 'u/s/photo.jpg', signaturePath: 'u/s/signature.png' };
    expect(podRpcArgs(payload)).toEqual({
      p_stop_id: 'stop-1',
      p_outcome: 'delivered',
      p_items_expected: 10,
      p_items_delivered: 10,
      p_signature_url: 'u/s/signature.png',
      p_photo_url: 'u/s/photo.jpg',
      p_notes: null,
      p_captured_offline: false,
      p_captured_at: '2026-10-04T03:00:00.000Z',
    });
  });

  it('maps location payloads', () => {
    expect(locationRpcArgs({ tripId: 't', lat: 1, lng: 2, recordedAt: 'x' })).toEqual({ p_trip_id: 't', p_lat: 1, p_lng: 2 });
  });

  it('builds storage paths under the driver uid', () => {
    expect(podStoragePaths('uid', 'stop')).toEqual({ photo: 'uid/stop/photo.jpg', signature: 'uid/stop/signature.png' });
  });
});

describe('helpers', () => {
  it('labels actions', () => {
    expect(actionLabel('POD_COMPLETE')).toBe('Proof of delivery');
  });
  it('strips data url prefixes', () => {
    expect(stripDataUrl('data:image/png;base64,AAA')).toBe('AAA');
    expect(stripDataUrl('AAA')).toBe('AAA');
  });
});
