const test = require("node:test");
const assert = require("node:assert/strict");
const { handleDriverLocation, registerSocketHandlers, DISPATCHERS_ROOM } = require("./socketHandlers");

const tripId = "b1042000-0000-0000-0000-000000000001";
const now = new Date("2026-10-04T08:00:00Z");

function fakeIo() {
  const emitted = [];
  return {
    emitted,
    to: (room) => ({ emit: (event, data) => emitted.push({ room, event, data }) }),
  };
}

function fakeRepo({ owns = true } = {}) {
  const calls = { owner: 0, saved: [] };
  return {
    calls,
    isDriverOfTrip: async () => (calls.owner++, owns),
    saveTripLocation: async (...args) => calls.saved.push(args),
  };
}

const driverSocket = () => ({ data: { user: { id: "d1", role: "driver" } } });

test("persists and broadcasts a driver's own location to dispatchers only", async () => {
  const io = fakeIo();
  const repo = fakeRepo();
  const socket = driverSocket();
  const payload = { tripId, lat: 6.9, lng: 79.8, heading: 10 };

  assert.deepEqual(await handleDriverLocation({ io, socket, repo, payload, now }), { ok: true });
  assert.deepEqual(repo.calls.saved, [[tripId, 6.9, 79.8, now.toISOString()]]);
  assert.equal(io.emitted.length, 1);
  assert.equal(io.emitted[0].room, DISPATCHERS_ROOM);
  assert.equal(io.emitted[0].event, "dispatcher_location_update");
  assert.equal(io.emitted[0].data.driverId, "d1");

  // ownership is cached for the connection
  await handleDriverLocation({ io, socket, repo, payload, now });
  assert.equal(repo.calls.owner, 1);
});

test("rejects updates for another driver's trip", async () => {
  const io = fakeIo();
  const repo = fakeRepo({ owns: false });
  const result = await handleDriverLocation({ io, socket: driverSocket(), repo, payload: { tripId, lat: 1, lng: 1 }, now });
  assert.deepEqual(result, { ok: false, error: "Trip is not assigned to you" });
  assert.equal(repo.calls.saved.length, 0);
  assert.equal(io.emitted.length, 0);
});

test("rejects non-drivers and invalid payloads", async () => {
  const io = fakeIo();
  const repo = fakeRepo();
  const dispatcher = { data: { user: { id: "x", role: "dispatcher" } } };
  assert.equal((await handleDriverLocation({ io, socket: dispatcher, repo, payload: { tripId, lat: 1, lng: 1 } })).ok, false);
  assert.equal((await handleDriverLocation({ io, socket: driverSocket(), repo, payload: { tripId, lat: 200, lng: 1 } })).ok, false);
  assert.equal(repo.calls.saved.length, 0);
});

test("registerSocketHandlers joins dispatchers to their room and acks driver updates", async () => {
  const io = fakeIo();
  let onConnection;
  io.on = (event, cb) => {
    if (event === "connection") onConnection = cb;
  };
  const repo = fakeRepo();
  registerSocketHandlers(io, repo, { error() {} });

  const joined = [];
  const dispatcher = { data: { user: { id: "x", role: "dispatcher" } }, join: (r) => joined.push(r), on() {} };
  onConnection(dispatcher);
  assert.deepEqual(joined, [DISPATCHERS_ROOM]);

  const handlers = {};
  const driver = { data: { user: { id: "d1", role: "driver" } }, join: () => joined.push("driver!"), on: (e, cb) => (handlers[e] = cb) };
  onConnection(driver);
  assert.deepEqual(joined, [DISPATCHERS_ROOM]);

  const ack = await new Promise((resolve) => handlers.driver_location_update({ tripId, lat: 1, lng: 2 }, resolve));
  assert.deepEqual(ack, { ok: true });
});

test("registerSocketHandlers reports storage failures via ack", async () => {
  const io = fakeIo();
  let onConnection;
  io.on = (_e, cb) => (onConnection = cb);
  registerSocketHandlers(io, { isDriverOfTrip: async () => true, saveTripLocation: async () => { throw new Error("db"); } }, { error() {} });
  const handlers = {};
  onConnection({ data: { user: { id: "d1", role: "driver" } }, join() {}, on: (e, cb) => (handlers[e] = cb) });
  const ack = await new Promise((resolve) => handlers.driver_location_update({ tripId, lat: 1, lng: 2 }, resolve));
  assert.deepEqual(ack, { ok: false, error: "Could not save location" });
});
