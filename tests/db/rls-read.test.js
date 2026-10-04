const test = require("node:test");
const assert = require("node:assert/strict");
const { IDS, connect, asUser } = require("./helpers");

let client;
test.before(async () => {
  client = await connect();
});
test.after(async () => {
  await client?.end();
});

const count = async (c, sql, params) => Number((await c.query(sql, params)).rows[0].count);

test("anon sees no orders, trips or stops", async () => {
  await asUser(client, null, async (c) => {
    for (const table of ["orders", "trips", "trip_stops"]) {
      // anon either has no table privilege at all (42501) or RLS filters every row
      await c.query("SAVEPOINT anon_read");
      try {
        assert.equal(await count(c, `SELECT count(*) FROM public.${table}`), 0, table);
      } catch (err) {
        if (err.code !== "42501") throw err;
        await c.query("ROLLBACK TO SAVEPOINT anon_read");
      }
    }
  });
});

test("driver sees only their own trip and its stops", async () => {
  await asUser(client, "driver@waypoint.com", async (c, { uid }) => {
    const trips = (await c.query("SELECT id, driver_id FROM public.trips")).rows;
    assert.ok(trips.length > 0, "driver should see their trip");
    assert.ok(trips.every((t) => t.driver_id === uid), "driver saw another driver's trip");
    assert.ok(trips.some((t) => t.id === IDS.driverTrip));

    assert.equal(await count(c, "SELECT count(*) FROM public.trips WHERE id = $1", [IDS.otherTrip]), 0);

    const stops = (await c.query("SELECT trip_id FROM public.trip_stops")).rows;
    assert.ok(stops.length > 0);
    const own = new Set(trips.map((t) => t.id));
    assert.ok(stops.every((s) => own.has(s.trip_id)), "driver saw stops of another trip");
  });
});

test("driver cannot read other users' profiles", async () => {
  await asUser(client, "driver@waypoint.com", async (c, { uid }) => {
    const rows = (await c.query("SELECT id FROM public.profiles")).rows;
    assert.deepEqual(rows.map((r) => r.id), [uid]);
  });
});

test("store manager sees only own store's orders, stops and receipts", async () => {
  await asUser(client, "store@waypoint.com", async (c) => {
    for (const table of ["orders", "trip_stops", "store_receipts"]) {
      const rows = (await c.query(`SELECT store_id FROM public.${table}`)).rows;
      assert.ok(
        rows.every((r) => r.store_id === IDS.freshStore22),
        `store manager saw another store's ${table}`
      );
    }
    assert.ok((await count(c, "SELECT count(*) FROM public.orders")) > 0, "store manager should see own orders");
  });
});

test("loader can read pallets, store manager cannot", async () => {
  await asUser(client, "load@waypoint.com", async (c) => {
    assert.ok((await count(c, "SELECT count(*) FROM public.pallets")) > 0);
  });
  await asUser(client, "store@waypoint.com", async (c) => {
    assert.equal(await count(c, "SELECT count(*) FROM public.pallets"), 0);
  });
});

test("users cannot escalate their own role", async () => {
  await asUser(client, "store@waypoint.com", async (c, { uid }) => {
    await assert.rejects(
      c.query("UPDATE public.profiles SET role = 'dispatcher' WHERE id = $1", [uid]),
      /Not allowed to change administrative profile fields/
    );
  });
  await asUser(client, "driver@waypoint.com", async (c, { uid }) => {
    await assert.rejects(
      c.query("UPDATE public.profiles SET store_id = $2 WHERE id = $1", [uid, IDS.freshStore22]),
      /Not allowed to change administrative profile fields/
    );
  });
});

test("users cannot self-verify or change permissions, status or employee id", async () => {
  await asUser(client, "store@waypoint.com", async (c, { uid }) => {
    for (const assignment of ["is_verified = NOT COALESCE(is_verified, false)", "permissions = '[\"admin\"]'::jsonb", "status = 'suspended'", "employee_id = 'HACK-1'"]) {
      await c.query("SAVEPOINT attempt");
      await assert.rejects(
        c.query(`UPDATE public.profiles SET ${assignment} WHERE id = $1`, [uid]),
        /Not allowed to change administrative profile fields/
      );
      await c.query("ROLLBACK TO SAVEPOINT attempt");
    }
  });
});

test("users can still edit their own contact details", async () => {
  await asUser(client, "store@waypoint.com", async (c, { uid }) => {
    const res = await c.query("UPDATE public.profiles SET phone = '+94770000000' WHERE id = $1", [uid]);
    assert.equal(res.rowCount, 1);
  });
});
