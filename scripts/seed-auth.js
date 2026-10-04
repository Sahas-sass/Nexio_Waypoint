#!/usr/bin/env node
/**
 * Creates (or updates) the demo login accounts in Supabase Auth and their
 * public.profiles rows. Must run before seeds/006_demo_day.sql, which looks
 * drivers up by email.
 *
 *   DEMO_PASSWORD=... node scripts/seed-auth.js
 *
 * Requires SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_KEY.
 */
const { loadEnv } = require("./lib/env");
const { createClient } = require("@supabase/supabase-js");
const { DEMO_ACCOUNTS } = require("./lib/demoAccounts");

loadEnv();

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DEMO_PASSWORD;

if (!url || !serviceKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_KEY are required.");
  process.exit(1);
}
if (!password || password.length < 8) {
  console.error("Set DEMO_PASSWORD (min 8 characters) for the demo accounts.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function findUserByEmail(email) {
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match || data.users.length < 200) return match ?? null;
  }
}

async function upsertAccount(account) {
  const existing = await findUserByEmail(account.email);
  let userId;

  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName, role: account.role },
    });
    if (error) throw error;
    userId = existing.id;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName, role: account.role },
    });
    if (error) throw error;
    userId = data.user.id;
  }

  const profile = { id: userId, role: account.role, full_name: account.fullName, ...account.profile };
  const { error: profileError } = await admin.from("profiles").upsert(profile, { onConflict: "id" });
  if (profileError) throw profileError;

  return userId;
}

(async () => {
  for (const account of DEMO_ACCOUNTS) {
    const id = await upsertAccount(account);
    console.log(`  ✓ ${account.role.padEnd(13)} ${account.email} (${id})`);
  }
  console.log("Demo accounts ready.");
})().catch((err) => {
  console.error("Failed to seed demo accounts:", err.message);
  process.exit(1);
});
