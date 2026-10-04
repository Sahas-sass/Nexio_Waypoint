const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { runSeed } = require("./run-seed");

function fakeClient(failOn) {
  const calls = [];
  return {
    calls,
    async query(sql) {
      calls.push(sql);
      if (sql === failOn) throw new Error("boom");
    },
  };
}

const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "seed-")), "s.sql");
fs.writeFileSync(file, "SELECT 1;");

test("runSeed wraps the file in a committed transaction", async () => {
  const client = fakeClient();
  await runSeed(file, client);
  assert.deepEqual(client.calls, ["BEGIN", "SELECT 1;", "COMMIT"]);
});

test("runSeed rolls back and rethrows on failure", async () => {
  const client = fakeClient("SELECT 1;");
  await assert.rejects(runSeed(file, client), /boom/);
  assert.deepEqual(client.calls, ["BEGIN", "SELECT 1;", "ROLLBACK"]);
});
