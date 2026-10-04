const test = require("node:test");
const assert = require("node:assert/strict");
const { loadConfig } = require("./config");

const base = { SUPABASE_URL: "https://x.supabase.co", SUPABASE_SERVICE_KEY: "key" };

test("loadConfig applies defaults", () => {
  assert.deepEqual(loadConfig(base), {
    port: 5000,
    supabaseUrl: "https://x.supabase.co",
    serviceKey: "key",
    corsOrigins: ["http://localhost:3000"],
  });
});

test("loadConfig parses CORS_ORIGINS and PORT", () => {
  const cfg = loadConfig({ ...base, PORT: "8080", CORS_ORIGINS: "https://a.com, https://b.com ," });
  assert.equal(cfg.port, 8080);
  assert.deepEqual(cfg.corsOrigins, ["https://a.com", "https://b.com"]);
});

test("loadConfig accepts alternative variable names", () => {
  const cfg = loadConfig({ NEXT_PUBLIC_SUPABASE_URL: "https://y.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "k2" });
  assert.equal(cfg.supabaseUrl, "https://y.supabase.co");
  assert.equal(cfg.serviceKey, "k2");
});

test("loadConfig rejects missing secrets and bad ports", () => {
  assert.throws(() => loadConfig({}), /SUPABASE_URL/);
  assert.throws(() => loadConfig({ ...base, PORT: "abc" }), /Invalid PORT/);
  assert.throws(() => loadConfig({ ...base, PORT: "70000" }), /Invalid PORT/);
});
