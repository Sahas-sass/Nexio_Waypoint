const test = require("node:test");
const assert = require("node:assert/strict");
const { createSocketAuth } = require("./socketAuth");

const silent = { error() {} };

function run(repo, auth) {
  const socket = { handshake: { auth }, data: {} };
  return new Promise((resolve) => {
    createSocketAuth(repo, silent)(socket, (err) => resolve({ err, socket }));
  });
}

const repo = (overrides = {}) => ({
  getUserFromToken: async (t) => (t === "good" ? { id: "u1" } : null),
  getProfileRole: async () => "driver",
  ...overrides,
});

test("rejects connections without a token", async () => {
  const { err } = await run(repo(), {});
  assert.match(err.message, /missing token/);
});

test("rejects invalid tokens", async () => {
  const { err } = await run(repo(), { token: "bad" });
  assert.match(err.message, /invalid token/);
});

test("rejects users without a profile", async () => {
  const { err } = await run(repo({ getProfileRole: async () => null }), { token: "good" });
  assert.match(err.message, /no profile/);
});

test("rejects when lookups fail", async () => {
  const { err } = await run(repo({ getProfileRole: async () => { throw new Error("db"); } }), { token: "good" });
  assert.equal(err.message, "unauthorized");
});

test("attaches the user id and role", async () => {
  const { err, socket } = await run(repo(), { token: "good" });
  assert.equal(err, undefined);
  assert.deepEqual(socket.data.user, { id: "u1", role: "driver" });
});
