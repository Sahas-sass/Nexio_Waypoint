const test = require("node:test");
const assert = require("node:assert/strict");
const { getPgConfig, projectRefFromUrl } = require("./pgConfig");

test("projectRefFromUrl extracts the Supabase project ref", () => {
  assert.equal(projectRefFromUrl("https://abcd1234.supabase.co"), "abcd1234");
  assert.equal(projectRefFromUrl("https://example.com"), null);
  assert.equal(projectRefFromUrl("not a url"), null);
  assert.equal(projectRefFromUrl(undefined), null);
});

test("getPgConfig prefers DATABASE_URL", () => {
  const cfg = getPgConfig({ DATABASE_URL: "postgres://u:p@h/db", DB_PASSWORD: "x" });
  assert.equal(cfg.connectionString, "postgres://u:p@h/db");
});

test("getPgConfig derives the pooler user from SUPABASE_URL", () => {
  const cfg = getPgConfig({ DB_PASSWORD: "pw", SUPABASE_URL: "https://ref123.supabase.co" });
  assert.equal(cfg.user, "postgres.ref123");
  assert.equal(cfg.password, "pw");
  assert.equal(cfg.port, 5432);
  assert.equal(cfg.database, "postgres");
});

test("getPgConfig honours explicit DB_* values", () => {
  const cfg = getPgConfig({ DB_PASSWORD: "pw", DB_USER: "me", DB_HOST: "h", DB_PORT: "6543", DB_NAME: "n" });
  assert.deepEqual([cfg.user, cfg.host, cfg.port, cfg.database], ["me", "h", 6543, "n"]);
});

test("getPgConfig throws without credentials or user", () => {
  assert.throws(() => getPgConfig({}), /DB_PASSWORD/);
  assert.throws(() => getPgConfig({ DB_PASSWORD: "pw" }), /DB_USER/);
});
