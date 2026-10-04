const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("./app");

async function withServer(fn) {
  const server = createApp({ corsOrigins: ["http://localhost:3000"] }).listen(0);
  await new Promise((r) => server.once("listening", r));
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

test("GET /health responds ok", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: "ok" });
  });
});

test("CORS only allows configured origins", async () => {
  await withServer(async (base) => {
    const allowed = await fetch(`${base}/health`, { headers: { Origin: "http://localhost:3000" } });
    assert.equal(allowed.headers.get("access-control-allow-origin"), "http://localhost:3000");
    const denied = await fetch(`${base}/health`, { headers: { Origin: "https://evil.example" } });
    assert.equal(denied.headers.get("access-control-allow-origin"), null);
  });
});

test("removed OTP endpoints are gone", async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/send-otp`, { method: "POST" });
    assert.equal(res.status, 404);
  });
});
