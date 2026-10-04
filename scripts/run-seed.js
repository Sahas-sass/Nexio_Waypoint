#!/usr/bin/env node
/**
 * Applies a single seed file inside one transaction.
 *
 *   node scripts/run-seed.js seeds/006_demo_day.sql
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { loadEnv } = require("./lib/env");
const { getPgConfig } = require("./lib/pgConfig");

async function runSeed(file, client) {
  const sql = fs.readFileSync(file, "utf-8");
  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: node scripts/run-seed.js <seed-file.sql>");
    process.exit(1);
  }
  const file = path.resolve(process.cwd(), arg);
  if (!fs.existsSync(file)) {
    console.error(`Seed file not found: ${file}`);
    process.exit(1);
  }
  loadEnv();
  const client = new Client(getPgConfig());
  await client.connect();
  try {
    await runSeed(file, client);
    console.log(`Seed applied: ${path.basename(file)}`);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
  });
}

module.exports = { runSeed };
