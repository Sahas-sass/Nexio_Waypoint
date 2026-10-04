/**
 * Shared helpers for the RLS / RPC integration tests.
 * Every scenario runs inside BEGIN … ROLLBACK, so nothing is ever persisted.
 */
const { Client } = require("pg");
const { loadEnv } = require("../../scripts/lib/env");
const { getPgConfig } = require("../../scripts/lib/pgConfig");

const IDS = {
  freshStore22: "a1111111-1111-1111-1111-111111111111",
  driverTrip: "b1042000-0000-0000-0000-000000000001", // TRIP 1042, driver@waypoint.com
  otherTrip: "b1045000-0000-0000-0000-000000000002", // TRIP 1045, driver2@waypoint.com
  deliveredOrder: "d0000000-0000-0000-0000-000000000005", // ORD-2999, Fresh Store #22
};

async function connect() {
  loadEnv();
  const client = new Client(getPgConfig());
  await client.connect();
  return client;
}

async function userId(client, email) {
  const { rows } = await client.query("SELECT id FROM auth.users WHERE email = $1", [email]);
  if (!rows[0]) throw new Error(`Demo user ${email} is missing – run scripts/seed-auth.js`);
  return rows[0].id;
}

/**
 * Runs fn(client, ctx) inside a rolled-back transaction as the given user
 * (email) or as the anon role (email = null). ctx.uid is the caller's user id.
 */
async function asUser(client, email, fn) {
  await client.query("BEGIN");
  try {
    const uid = email ? await userId(client, email) : null;
    if (uid) {
      await client.query("SET LOCAL ROLE authenticated");
      await client.query("SELECT set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: uid, role: "authenticated" }),
      ]);
    } else {
      await client.query("SET LOCAL ROLE anon");
      await client.query("SELECT set_config('request.jwt.claims', $1, true)", [JSON.stringify({ role: "anon" })]);
    }
    return await fn(client, { uid });
  } finally {
    await client.query("ROLLBACK");
  }
}

/** Runs a statement that must fail; isolates the failure with a savepoint. Returns the error. */
async function expectError(client, sql, params = [], pattern) {
  await client.query("SAVEPOINT expect_error");
  try {
    await client.query(sql, params);
  } catch (err) {
    await client.query("ROLLBACK TO SAVEPOINT expect_error");
    if (pattern && !pattern.test(err.message)) {
      throw new Error(`Expected error matching ${pattern}, got: ${err.message}`);
    }
    return err;
  }
  throw new Error(`Expected statement to fail: ${sql}`);
}

/** Today's date in Asia/Colombo plus n days, as YYYY-MM-DD (computed by the DB). */
async function colomboDate(client, plusDays = 0) {
  const { rows } = await client.query(
    "SELECT to_char((now() AT TIME ZONE 'Asia/Colombo')::date + $1::int, 'YYYY-MM-DD') AS d",
    [plusDays]
  );
  return rows[0].d;
}

module.exports = { IDS, connect, asUser, expectError, colomboDate };
