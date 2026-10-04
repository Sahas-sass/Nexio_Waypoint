import type { TripStop } from '@/features/trip/types';

type Os = 'ios' | 'android' | 'web' | string;

/** Maps deep link for the stop: coordinates when known, otherwise the store address. Null when neither exists. */
export function navigationUrl(stop: Pick<TripStop, 'storeName' | 'address' | 'latitude' | 'longitude'>, os: Os): string | null {
  const hasCoords = stop.latitude != null && stop.longitude != null;
  if (!hasCoords && !stop.address) return null;
  const query = hasCoords
    ? `${stop.latitude},${stop.longitude}`
    : encodeURIComponent(`${stop.storeName}, ${stop.address}`);
  if (os === 'ios') return `maps:0,0?q=${query}`;
  if (os === 'android') return `geo:0,0?q=${query}`;
  return `https://maps.google.com/?q=${query}`;
}

/** Web fallback used when the native maps scheme cannot be opened. */
export function webMapsUrl(stop: Pick<TripStop, 'storeName' | 'address' | 'latitude' | 'longitude'>): string | null {
  return navigationUrl(stop, 'web');
}

/** tel: link with spaces/dashes removed, or null when there is no usable number. */
export function phoneUrl(phone: string | null | undefined): string | null {
  const digits = (phone ?? '').replace(/[^\d+]/g, '');
  return digits.length >= 6 ? `tel:${digits}` : null;
}
