const test = require("node:test");
const assert = require("node:assert/strict");
const { validateLocationPayload } = require("./validation");

const now = new Date("2026-10-04T08:00:00Z");
const tripId = "b1042000-0000-0000-0000-000000000001";

test("accepts a valid payload and normalises optional fields", () => {
  assert.deepEqual(validateLocationPayload({ tripId, lat: 6.9, lng: 79.86 }, now), {
    ok: true,
    value: { tripId, lat: 6.9, lng: 79.86, heading: null, speed: null, timestamp: now.toISOString() },
  });
});

test("keeps heading, speed and a past timestamp", () => {
  const r = validateLocationPayload({ tripId, lat: 0, lng: 0, heading: 90, speed: 12.5, timestamp: "2026-10-04T07:59:00Z" }, now);
  assert.equal(r.ok, true);
  assert.equal(r.value.heading, 90);
  assert.equal(r.value.speed, 12.5);
  assert.equal(r.value.timestamp, "2026-10-04T07:59:00.000Z");
});

test("clamps future timestamps to the server time", () => {
  const r = validateLocationPayload({ tripId, lat: 0, lng: 0, timestamp: Date.parse("2026-10-05T00:00:00Z") }, now);
  assert.equal(r.value.timestamp, now.toISOString());
});

test("rejects invalid payloads", () => {
  const bad = [
    null,
    [],
    "x",
    { tripId: "not-a-uuid", lat: 1, lng: 1 },
    { tripId, lat: 91, lng: 1 },
    { tripId, lat: 1, lng: -181 },
    { tripId, lat: "6.9", lng: 79 },
    { tripId, lat: NaN, lng: 79 },
    { tripId, lat: 1, lng: 1, heading: 400 },
    { tripId, lat: 1, lng: 1, speed: -1 },
    { tripId, lat: 1, lng: 1, timestamp: "yesterday" },
    { tripId, lat: 1, lng: 1, timestamp: {} },
  ];
  for (const payload of bad) {
    assert.equal(validateLocationPayload(payload, now).ok, false, JSON.stringify(payload));
  }
});
