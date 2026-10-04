/**
 * End-to-end delivery workflow across all four roles, run as the real users
 * against the database inside one transaction that is rolled back at the end:
 *
 *   store manager orders → dispatcher plans → loader sees the trip →
 *   driver delivers with proof of delivery → store confirms receipt with an
 *   issue → dispatcher sees the exception. A second order is deferred and
 *   shows up as an alert for the store.
 */
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { IDS, connect, colomboDate } = require("./helpers");

let client;
before(async () => {
  client = await connect();
});
after(async () => {
  await client.end();
});

/** Switch the current transaction to act as the given demo user. */
async function actAs(email) {
  await client.query("RESET ROLE");
  const { rows } = await client.query("SELECT id FROM auth.users WHERE email = $1", [email]);
  await client.query("SELECT set_config('request.jwt.claims', $1, true)", [
    JSON.stringify({ sub: rows[0].id, role: "authenticated" }),
  ]);
  await client.query("SET LOCAL ROLE authenticated");
  return rows[0].id;
}

async function one(sql, params = []) {
  const { rows } = await client.query(sql, params);
  return rows[0];
}

test("an order flows from store manager to dispatcher, loader, driver and back to the store", async () => {
  await client.query("BEGIN");
  try {
    const deliveryDate = await colomboDate(client, 3);

    // 1. Store manager places two orders for their own store
    await actAs("store@waypoint.com");
    const order = await one(
      "SELECT * FROM public.place_order($1::date, 'chilled', 300, 2.5, 15, 'High', 'E2E test order')",
      [deliveryDate]
    );
    const deferredOrder = await one(
      "SELECT * FROM public.place_order($1::date, 'ambient', 200, 1.5, 10, 'Low', NULL)",
      [deliveryDate]
    );
    assert.equal(order.status, "pending");
    assert.equal(order.store_id, IDS.freshStore22);

    // 2. Dispatcher sees the queue, publishes a plan on the refrigerated van and defers the other order
    const dispatcherId = await actAs("dispatch@waypoint.com");
    const queued = await one("SELECT count(*)::int AS n FROM public.orders WHERE id = ANY($1)", [[order.id, deferredOrder.id]]);
    assert.equal(queued.n, 2);

    const van = await one("SELECT id, driver_id FROM public.vehicles WHERE registration_number = 'VAN-016'");
    const { trip } = await one("SELECT public.publish_vehicle_plan($1, $2::date, $3::uuid[]) AS trip", [
      van.id,
      deliveryDate,
      [order.id],
    ]);
    const plannedTrip = await one("SELECT status, driver_id FROM public.trips WHERE id = $1", [trip]);
    assert.equal(plannedTrip.status, "planning");
    assert.equal(plannedTrip.driver_id, van.driver_id, "trip is driven by the vehicle's driver");
    assert.equal((await one("SELECT status FROM public.orders WHERE id = $1", [order.id])).status, "assigned");

    await client.query(
      `UPDATE public.orders SET status = 'deferred', deferral_reason = 'Reefer Shortage', deferred_at = now(), deferred_by = $2
       WHERE id = $1`,
      [deferredOrder.id, dispatcherId]
    );
    await client.query(
      `INSERT INTO public.deferral_logs (order_id, order_number, store_id, store_name, reason, rescheduled_run, deferred_by)
       VALUES ($1, $2, $3, 'Fresh Store #22', 'Reefer Shortage', 'Next available run', $4)`,
      [deferredOrder.id, deferredOrder.order_number, IDS.freshStore22, dispatcherId]
    );

    // 3. Loader sees the planned trip and its stop
    await actAs("load@waypoint.com");
    const loaderView = await one("SELECT count(*)::int AS n FROM public.trip_stops WHERE trip_id = $1", [trip]);
    assert.equal(loaderView.n, 1);

    // 4. Another driver cannot see this trip; the assigned driver delivers it
    await actAs("driver@waypoint.com");
    assert.equal((await one("SELECT count(*)::int AS n FROM public.trips WHERE id = $1", [trip])).n, 0);

    await client.query("RESET ROLE");
    const assigned = await one("SELECT email FROM auth.users WHERE id = $1", [van.driver_id]);
    await actAs(assigned.email);
    const stop = await one("SELECT id, status FROM public.trip_stops WHERE trip_id = $1", [trip]);
    assert.equal(stop.status, "PENDING");
    await client.query("SELECT public.driver_start_stop($1)", [stop.id]);
    assert.equal((await one("SELECT status FROM public.trip_stops WHERE id = $1", [stop.id])).status, "IN_PROGRESS");

    await client.query(
      "SELECT public.submit_proof_of_delivery($1, 'partial', 15, 14, NULL, NULL, 'One case damaged', true, now())",
      [stop.id]
    );
    // Offline retry of the same POD is safe
    await client.query(
      "SELECT public.submit_proof_of_delivery($1, 'partial', 15, 14, NULL, NULL, 'One case damaged', true, now())",
      [stop.id]
    );
    assert.equal((await one("SELECT status FROM public.trip_stops WHERE id = $1", [stop.id])).status, "COMPLETED");
    assert.equal((await one("SELECT status FROM public.trips WHERE id = $1", [trip])).status, "completed");

    // 5. Store manager sees the delivery, the POD and the deferral alert, then confirms with a shortage
    await actAs("store@waypoint.com");
    assert.equal((await one("SELECT status FROM public.orders WHERE id = $1", [order.id])).status, "delivered");
    const pod = await one("SELECT items_delivered, outcome FROM public.proof_of_delivery WHERE stop_id = $1", [stop.id]);
    assert.deepEqual(pod, { items_delivered: 14, outcome: "partial" });
    const alert = await one("SELECT reason FROM public.deferral_logs WHERE order_id = $1", [deferredOrder.id]);
    assert.equal(alert.reason, "Reefer Shortage");

    const receipt = await one("SELECT * FROM public.confirm_order_receipt($1, 14, 'damaged', 'One case crushed')", [order.id]);
    assert.equal(receipt.status, "partial");

    // 6. Dispatcher sees the store's issue as an exception
    await actAs("dispatch@waypoint.com");
    const exception = await one("SELECT reason_code FROM public.exceptions WHERE order_id = $1", [order.id]);
    assert.equal(exception.reason_code, "DAMAGED");
  } finally {
    await client.query("ROLLBACK");
  }
});
