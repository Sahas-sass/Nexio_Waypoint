export interface LatLng {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance between two coordinates in kilometres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Distance label from the device to a target, or null when either side is
 * unknown (callers hide the distance instead of showing a fake value).
 */
export function distanceLabel(
  from: LatLng | null | undefined,
  to: { latitude: number | null; longitude: number | null } | null | undefined
): string | null {
  if (!from || !to || to.latitude == null || to.longitude == null) return null;
  const km = haversineKm(from, { latitude: to.latitude, longitude: to.longitude });
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
