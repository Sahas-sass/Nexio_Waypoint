const test = require("node:test");
const assert = require("node:assert/strict");
const { createRepository } = require("./repository");

/** Minimal chainable fake of the supabase-js query builder. */
function fakeSupabase({ user = null, authError = null, row = null, error = null } = {}) {
  const calls = [];
  const builder = {
    select: (...a) => (calls.push(["select", ...a]), builder),
    update: (...a) => (calls.push(["update", ...a]), builder),
    eq: (...a) => (calls.push(["eq", ...a]), builder),
    maybeSingle: async () => ({ data: row, error }),
    then: (resolve) => resolve({ error }),
  };
  return {
    calls,
    auth: { getUser: async (token) => (calls.push(["getUser", token]), { data: { user }, error: authError }) },
    from: (table) => (calls.push(["from", table]), builder),
  };
}

test("getUserFromToken returns the user or null", async () => {
  assert.deepEqual(await createRepository(fakeSupabase({ user: { id: "u1" } })).getUserFromToken("t"), { id: "u1" });
  assert.equal(await createRepository(fakeSupabase({ authError: new Error("x") })).getUserFromToken("t"), null);
});

test("getProfileRole reads profiles.role", async () => {
  const sb = fakeSupabase({ row: { role: "driver" } });
  assert.equal(await createRepository(sb).getProfileRole("u1"), "driver");
  assert.deepEqual(sb.calls.slice(0, 3), [["from", "profiles"], ["select", "role"], ["eq", "id", "u1"]]);
  assert.equal(await createRepository(fakeSupabase()).getProfileRole("u1"), null);
});

test("isDriverOfTrip filters by trip and driver", async () => {
  const sb = fakeSupabase({ row: { id: "t1" } });
  assert.equal(await createRepository(sb).isDriverOfTrip("t1", "u1"), true);
  assert.ok(sb.calls.some((c) => c[0] === "eq" && c[1] === "driver_id" && c[2] === "u1"));
  assert.equal(await createRepository(fakeSupabase()).isDriverOfTrip("t1", "u1"), false);
  await assert.rejects(createRepository(fakeSupabase({ error: { message: "db down" } })).isDriverOfTrip("t1", "u1"), /db down/);
});

test("saveTripLocation updates the trip position", async () => {
  const sb = fakeSupabase();
  await createRepository(sb).saveTripLocation("t1", 6.9, 79.8, "2026-10-04T08:00:00.000Z");
  const update = sb.calls.find((c) => c[0] === "update")[1];
  assert.equal(update.current_lat, 6.9);
  assert.equal(update.current_lng, 79.8);
  assert.equal(update.last_ping_at, "2026-10-04T08:00:00.000Z");
  assert.equal(update.connection_status, "online");
  await assert.rejects(createRepository(fakeSupabase({ error: { message: "nope" } })).saveTripLocation("t1", 0, 0, "x"), /nope/);
});
