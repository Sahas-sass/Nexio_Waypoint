import type { SyncActionType } from '../types';

export type PodOutcome = 'delivered' | 'partial' | 'failed';

export interface StatusPayload {
  stopId: string;
}

export interface LocationPayload {
  tripId: string;
  lat: number;
  lng: number;
  recordedAt: string;
}

export interface PodPhoto {
  base64: string;
  mimeType: string;
}

export interface PodPayload {
  stopId: string;
  outcome: PodOutcome;
  itemsExpected: number;
  itemsDelivered: number;
  notes: string | null;
  capturedOffline: boolean;
  capturedAt: string;
  photo: PodPhoto | null;
  /** PNG image of the signature, base64 without a data: prefix. */
  signaturePng: string | null;
  /** Filled in once the evidence has been uploaded, so retries skip the upload. */
  photoPath: string | null;
  signaturePath: string | null;
}

export interface PodInput {
  stopId: string;
  itemsExpected: number;
  itemsDelivered: number;
  failed?: boolean;
  notes?: string | null;
  photo?: PodPhoto | null;
  signaturePng?: string | null;
  isOnline: boolean;
  capturedAt?: Date;
}

export const MAX_NOTES_LENGTH = 500;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Delivered when every item arrived, partial when some did, failed when flagged or none. */
export function podOutcome(itemsExpected: number, itemsDelivered: number, failed = false): PodOutcome {
  if (failed || itemsDelivered === 0) return 'failed';
  return itemsDelivered >= itemsExpected ? 'delivered' : 'partial';
}

/** Validate driver input and build the offline-safe POD payload. Throws on invalid input. */
export function buildPodPayload(input: PodInput): PodPayload {
  const { itemsExpected, itemsDelivered } = input;
  if (!input.stopId) throw new Error('Missing stop.');
  if (!Number.isInteger(itemsExpected) || itemsExpected < 0) throw new Error('Expected item count is invalid.');
  if (!Number.isInteger(itemsDelivered) || itemsDelivered < 0 || itemsDelivered > itemsExpected) {
    throw new Error(`Delivered items must be between 0 and ${itemsExpected}.`);
  }
  const outcome = podOutcome(itemsExpected, itemsDelivered, input.failed);
  const notes = input.notes?.trim().slice(0, MAX_NOTES_LENGTH) || null;
  if (outcome !== 'delivered' && !notes) {
    throw new Error('Add a note explaining the shortfall or failed delivery.');
  }
  if (outcome !== 'failed' && !input.signaturePng) {
    throw new Error('A store signature is required.');
  }
  const photo = input.photo
    ? {
        base64: input.photo.base64,
        mimeType: ALLOWED_PHOTO_TYPES.includes(input.photo.mimeType) ? input.photo.mimeType : 'image/jpeg',
      }
    : null;
  return {
    stopId: input.stopId,
    outcome,
    itemsExpected,
    itemsDelivered,
    notes,
    capturedOffline: !input.isOnline,
    capturedAt: (input.capturedAt ?? new Date()).toISOString(),
    photo,
    signaturePng: input.signaturePng || null,
    photoPath: null,
    signaturePath: null,
  };
}

export function podStoragePaths(userId: string, stopId: string) {
  return {
    photo: `${userId}/${stopId}/photo.jpg`,
    signature: `${userId}/${stopId}/signature.png`,
  };
}

export function podRpcArgs(payload: PodPayload) {
  return {
    p_stop_id: payload.stopId,
    p_outcome: payload.outcome,
    p_items_expected: payload.itemsExpected,
    p_items_delivered: payload.itemsDelivered,
    p_signature_url: payload.signaturePath,
    p_photo_url: payload.photoPath,
    p_notes: payload.notes,
    p_captured_offline: payload.capturedOffline,
    p_captured_at: payload.capturedAt,
  };
}

export function locationRpcArgs(payload: LocationPayload) {
  return { p_trip_id: payload.tripId, p_lat: payload.lat, p_lng: payload.lng };
}

const ACTION_LABELS: Record<SyncActionType, string> = {
  STATUS_UPDATE: 'Stop started',
  POD_COMPLETE: 'Proof of delivery',
  LOCATION_UPDATE: 'GPS position',
};

export const actionLabel = (type: SyncActionType) => ACTION_LABELS[type];

/** Strip an optional "data:image/png;base64," prefix. */
export function stripDataUrl(value: string): string {
  const comma = value.indexOf(',');
  return value.startsWith('data:') && comma !== -1 ? value.slice(comma + 1) : value;
}
