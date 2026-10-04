#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

// 1. Load environment variables
const envPaths = [
  path.resolve(__dirname, "../api-backend/.env"),
  path.resolve(__dirname, "../web-portals/.env.local"),
  path.resolve(__dirname, "../.env")
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...vals] = trimmed.split("=");
      if (key && vals.length > 0 && !process.env[key.trim()]) {
        process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

const { getPgConfig } = require("./lib/pgConfig");

let Client;
try {
  Client = require("pg").Client;
} catch {
  try {
    Client = require(path.resolve(__dirname, "../api-backend/node_modules/pg")).Client;
  } catch {}
}

async function main() {
  console.log("\n============================================");
  console.log("      Waypoint Database Data Seeding        ");
  console.log("============================================\n");

  const seedsDir = path.resolve(__dirname, "../seeds");
  if (!fs.existsSync(seedsDir)) {
    console.log("❌ No seeds directory found at:", seedsDir);
    return;
  }

  const files = fs.readdirSync(seedsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("ℹ️ No .sql seed files found in seeds/.");
    return;
  }

  console.log(`🌱 Found ${files.length} seed file(s):`);
  files.forEach(f => console.log(`   - ${f}`));

  const dbPassword = process.env.DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD;
  const dbUrl = process.env.DATABASE_URL;

  if (!Client || (!dbPassword && !dbUrl)) {
    console.error("❌ PostgreSQL client or database credentials missing in .env.");
    return;
  }

  const config = getPgConfig();

  const pgClient = new Client(config);
  await pgClient.connect();
  console.log("\n🔌 Connected directly to Supabase PostgreSQL database!");

  try {
    for (const file of files) {
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");
      console.log(`\n⏳ Executing seed: ${file}...`);
      await pgClient.query("BEGIN;");
      try {
        await pgClient.query(sql);
        await pgClient.query("COMMIT;");
        console.log(`   ✅ Successfully seeded: ${file}`);
      } catch (err) {
        await pgClient.query("ROLLBACK;");
        console.error(`   ❌ Failed to seed ${file}:`, err.message);
        throw err;
      }
    }
    console.log("\n🎉 All database seeds executed successfully!\n");
  } finally {
    await pgClient.end();
  }
}

main().catch(console.error);
