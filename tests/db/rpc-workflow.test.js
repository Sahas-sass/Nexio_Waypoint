const test = require("node:test");
const assert = require("node:assert/strict");
const { IDS, connect, asUser, expectError, colomboDate } = require("./helpers");

let client;
test.before(async () => {
  client = await connect();
});
test.after(async () => {
  await client?.end();
});

const PLACE_ORDER = "SELECT * FROM public.place_order($1::date, 'ambient', 120, 1.5, 10, 'Standard', 'rls test')";

test("place_order rejects a date before the cutoff and accepts a valid date", async () => {
  const today = await colomboDate(client, 0);
  const valid = await colomboDate(client, 2); // always past the 16:00 cutoff window
  await asUser(client, "store@waypoint.com", async (c, { uid }) => {
    await expectError(c, PLACE_ORDER, [today], /cutoff/i);
    const { rows } = await c.query(PLACE_ORDER, [valid]);
    assert.equal(rows[0].store_id, IDS.freshStore22);
    assert.equal(rows[0].status, "pending");
    assert.equal(rows[0].created_by, uid);
  });
});

test("place_order is rejected for drivers", async () => {
  const valid = await colomboDate(client, 2);
  await asUser(client, "driver@waypoint.com", async (c) => {
    await expectError(c, PLACE_ORDER, [valid], /Only store managers/);
  });
});

test("confirm_order_receipt guards store ownership and delivery status", async () => {
  const { rows: other } = await client.query(
    "SELECT id FROM public.orders WHERE store_id <> $1 AND status = 'delivered' LIMIT 1",
    [IDS.freshStore22]
  );
  const { rows: undelivered } = await client.query(
    "SELECT id FROM public.orders o WHERE store_id = $1 AND status <> 'delivered' LIMIT 1",
    [IDS.freshStore22]
  );
  const { rows: anyOther } = await client.query("SELECT id FROM public.orders WHERE store_id <> $1 LIMIT 1", [
    IDS.freshStore22,
  ]);
  const otherOrder = (other[0] || anyOther[0]).id;
  assert.ok(undelivered[0], "fixture: store needs a non-delivered order");

  await asUser(client, "store@waypoint.com", async (c, { uid }) => {
    await expectError(c, "SELECT public.confirm_order_receipt($1, 1)", [otherOrder], /not found for your store/);
    await expectError(c, "SELECT public.confirm_order_receipt($1, 1)", [undelivered[0].id], /not been delivered/);

    const { rows } = await c.query("SELECT * FROM public.confirm_order_receipt($1, 14)", [IDS.deliveredOrder]);
    assert.equal(rows[0].status, "received");
    assert.equal(rows[0].confirmed_by, uid);
  });
});

test("submit_proof_of_delivery only works for stops on the driver's own trip", async () => {
  const { rows: ownStops } = await client.query(
    "SELECT id FROM public.trip_stops WHERE trip_id = $1 AND status IN ('PENDING','IN_PROGRESS') ORDER BY stop_sequence LIMIT 1",
    [IDS.driverTrip]
  );
  const { rows: otherStops } = await client.query("SELECT id FROM public.trip_stops WHERE trip_id = $1 LIMIT 1", [
    IDS.otherTrip,
  ]);
  assert.ok(ownStops[0] && otherStops[0], "fixture: both trips need stops");
  const sql = "SELECT * FROM public.submit_proof_of_delivery($1, 'delivered', 10, 10)";

  await asUser(client, "driver@waypoint.com", async (c, { uid }) => {
    await expectError(c, sql, [otherStops[0].id], /not on your trip/);

    const { rows } = await c.query(sql, [ownStops[0].id]);
    assert.equal(rows[0].captured_by, uid);
    const stop = await c.query("SELECT status FROM public.trip_stops WHERE id = $1", [ownStops[0].id]);
    assert.equal(stop.rows[0].status, "COMPLETED");
  });
});
