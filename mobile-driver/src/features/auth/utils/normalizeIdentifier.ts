export const DRIVER_EMAIL_DOMAIN = 'waypoint.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DRIVER_ID_RE = /^[a-z0-9._-]+$/;

/**
 * Turn what the driver typed into a sign-in email.
 * "driver" → "driver@waypoint.com", "Driver2@Waypoint.com" → "driver2@waypoint.com".
 * Returns null when the input cannot be an account identifier.
 */
export function normalizeIdentifier(input: string): string | null {
  const value = input.trim().toLowerCase();
  if (!value) return null;
  if (value.includes('@')) return EMAIL_RE.test(value) ? value : null;
  return DRIVER_ID_RE.test(value) ? `${value}@${DRIVER_EMAIL_DOMAIN}` : null;
}
