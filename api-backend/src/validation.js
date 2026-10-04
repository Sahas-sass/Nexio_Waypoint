const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

function inRange(value, min, max) {
  return isFiniteNumber(value) && value >= min && value <= max;
}

/**
 * Validates a driver_location_update payload.
 * Returns { ok: true, value } with a normalised payload or { ok: false, error }.
 */
function validateLocationPayload(payload, now = new Date()) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Payload must be an object" };
  }
  const { tripId, lat, lng, heading, speed, timestamp } = payload;

  if (typeof tripId !== "string" || !UUID_PATTERN.test(tripId)) {
    return { ok: false, error: "tripId must be a UUID" };
  }
  if (!inRange(lat, -90, 90)) return { ok: false, error: "lat must be a number between -90 and 90" };
  if (!inRange(lng, -180, 180)) return { ok: false, error: "lng must be a number between -180 and 180" };
  if (heading != null && !inRange(heading, 0, 360)) {
    return { ok: false, error: "heading must be between 0 and 360" };
  }
  if (speed != null && !inRange(speed, 0, 100)) {
    return { ok: false, error: "speed must be between 0 and 100 m/s" };
  }

  let recordedAt = now;
  if (timestamp != null) {
    const parsed = new Date(timestamp);
    if ((typeof timestamp !== "string" && typeof timestamp !== "number") || Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "timestamp must be an ISO date string or epoch milliseconds" };
    }
    // Never trust a client clock that is ahead of the server
    recordedAt = parsed > now ? now : parsed;
  }

  return {
    ok: true,
    value: {
      tripId,
      lat,
      lng,
      heading: heading ?? null,
      speed: speed ?? null,
      timestamp: recordedAt.toISOString(),
    },
  };
}

module.exports = { validateLocationPayload, UUID_PATTERN };
