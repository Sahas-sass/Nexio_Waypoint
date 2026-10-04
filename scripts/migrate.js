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

let createClient;
try {
  createClient = require("@supabase/supabase-js").createClient;
} catch {
  try {
    createClient = require(path.resolve(__dirname, "../api-backend/node_modules/@supabase/supabase-js")).createClient;
  } catch {
    createClient = require(path.resolve(__dirname, "../web-portals/node_modules/@supabase/supabase-js")).createClient;
  }
}

let Client;
try {
  Client = require("pg").Client;
} catch {
  try {
    Client = require(path.resolve(__dirname, "../api-backend/node_modules/pg")).Client;
  } catch {}
}

const { getPgConfig } = require("./lib/pgConfig");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_KEY are required.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runDirectPostgresMigration(client, sql, filename) {
  await client.query("BEGIN;");
  try {
    // Create migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public._migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Check if already applied
    const checkRes = await client.query("SELECT id FROM public._migrations WHERE filename = $1;", [filename]);
    if (checkRes.rows.length > 0) {
      console.log(`   ⏩ Already applied: ${filename}`);
      await client.query("ROLLBACK;");
      return;
    }

    // Execute migration
    await client.query(sql);
    await client.query("INSERT INTO public._migrations (filename) VALUES ($1);", [filename]);
    await client.query("COMMIT;");
    console.log(`   ✅ Successfully applied: ${filename}`);
  } catch (err) {
    await client.query("ROLLBACK;");
    throw err;
  }
}

async function main() {
  console.log("\n============================================");
  console.log("   Waypoint Supabase Database Migrations    ");
  console.log("============================================\n");

  // 1. Ensure Storage Bucket Exists
  console.log("📁 1. Verifying Supabase Storage ('avatars' bucket)...");
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === "avatars");
    if (!exists) {
      await supabase.storage.createBucket("avatars", {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"]
      });
      console.log("   ✅ 'avatars' storage bucket created and configured.");
    } else {
      console.log("   ✅ 'avatars' storage bucket is ready.");
    }
  } catch (err) {
    console.warn("   ⚠️ Storage check:", err.message);
  }

  // 2. Load Migration Files
  const migrationsDir = path.resolve(__dirname, "../migrations");
  if (!fs.existsSync(migrationsDir)) {
    console.log("❌ No migrations directory found at:", migrationsDir);
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("ℹ️ No .sql migration files found in migrations/.");
    return;
  }

  console.log(`\n📄 2. Found ${files.length} migration file(s):`);
  files.forEach(f => console.log(`   - ${f}`));

  // 3. Check for Direct Postgres Connection (DB_PASSWORD or DATABASE_URL)
  const dbPassword = process.env.DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD;
  const dbUrl = process.env.DATABASE_URL;

  let directConnected = false;
  let pgClient = null;

  if (Client && (dbPassword || dbUrl)) {
    console.log("\n🔌 3. Attempting direct PostgreSQL connection...");
    try {
      const config = getPgConfig();

      pgClient = new Client(config);
      await pgClient.connect();
      directConnected = true;
      console.log("   ✅ Connected directly to Supabase PostgreSQL database!");
    } catch (err) {
      console.log("   ⚠️ Direct Postgres connection failed:", err.message);
      if (pgClient) {
        try { await pgClient.end(); } catch {}
        pgClient = null;
      }
    }
  }

  // 4. Run Migrations via Direct Postgres
  if (directConnected && pgClient) {
    console.log("\n⚡ 4. Executing SQL migrations directly...");
    try {
      for (const file of files) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, "utf-8");
        await runDirectPostgresMigration(pgClient, sql, file);
      }
      console.log("\n🎉 All database migrations applied successfully!\n");
    } finally {
      await pgClient.end();
    }
    return;
  }

  // 5. Fallback: Try RPC exec_sql
  console.log("\n⚡ 3. Checking Supabase RPC migration runner...");
  let rpcReady = false;
  try {
    const { error } = await supabase.rpc("exec_sql", { query: "SELECT 1;" });
    if (!error) {
      rpcReady = true;
    }
  } catch {}

  if (rpcReady) {
    console.log("   ✅ RPC exec_sql is available. Applying migrations...");
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");
      console.log(`   ⏳ Applying ${file}...`);
      const { error } = await supabase.rpc("exec_sql", { query: sql });
      if (error) {
        console.error(`   ❌ Migration ${file} failed:`, error.message);
        process.exitCode = 1;
        return;
      }
      console.log(`   ✅ Applied ${file} successfully.`);
    }
    console.log("\n🎉 All database migrations executed successfully!\n");
    return;
  }

  // 6. If neither is configured yet, guide user with exact 1-step solution
  process.exitCode = 1;
  console.log("\n🔑 To execute migrations directly via `npm run migrate`, choose ONE of these 2 options:\n");
  console.log("👉 Option A (Recommended - Instant Direct DB Connection):");
  console.log("   Add your Supabase database password to `api-backend/.env`:");
  console.log("   DB_PASSWORD=your_supabase_db_password\n");
  console.log("   (Then just run `npm run migrate` and it connects directly to PostgreSQL and runs all migrations!)\n");
  console.log("👉 Option B (Via Supabase SQL Helper):");
  console.log("   Paste this once into Supabase SQL Editor:");
  console.log(`
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;
  `);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
