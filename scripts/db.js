#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

// Load .env from api-backend if not already in process.env
const envPath = path.resolve(__dirname, "../api-backend/.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...vals] = trimmed.split("=");
    if (key && vals.length > 0) {
      process.env[key.trim()] = vals.join("=").trim();
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

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_KEY are required.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function listUsers() {
  console.log("\n📦 Fetching Supabase Users & Profiles...\n");
  const { data: usersData, error: userErr } = await supabase.auth.admin.listUsers();
  if (userErr) {
    console.error("❌ Error listing auth users:", userErr.message);
    return;
  }

  const { data: profiles, error: profErr } = await supabase.from("profiles").select("*");
  if (profErr) {
    console.error("❌ Error listing profiles:", profErr.message);
    return;
  }

  const profileMap = new Map((profiles || []).map(p => [p.id, p]));

  const rows = usersData.users.map(u => {
    const p = profileMap.get(u.id) || {};
    const meta = u.user_metadata || {};
    return {
      ID: u.id.slice(0, 8) + "...",
      Email: u.email,
      "Full Name": p.full_name || meta.full_name || "N/A",
      Role: p.role || "N/A",
      "Assigned Bay": p.assigned_bay || meta.assigned_bay || "N/A",
      Station: p.station || meta.station || "N/A",
      Shift: p.shift || meta.shift || "N/A"
    };
  });

  console.table(rows);
}

async function updateProfile(identifier, updates) {
  console.log(`\n🔄 Updating profile for "${identifier}"...`);

  const { data: usersData } = await supabase.auth.admin.listUsers();
  const user = usersData.users.find(u => u.email === identifier || u.id === identifier);

  if (!user) {
    console.error(`❌ User not found with email or ID: ${identifier}`);
    return;
  }

  // Parse updates (e.g. bay="Bay 02" name="New Name")
  const metaUpdates = { ...user.user_metadata };
  const tableUpdates = {};

  for (const [key, val] of Object.entries(updates)) {
    if (key === "name" || key === "full_name") {
      tableUpdates.full_name = val;
      metaUpdates.full_name = val;
    } else if (key === "bay" || key === "assigned_bay") {
      tableUpdates.assigned_bay = val;
      metaUpdates.assigned_bay = val;
    } else if (key === "station") {
      tableUpdates.station = val;
      metaUpdates.station = val;
    } else if (key === "shift") {
      tableUpdates.shift = val;
      metaUpdates.shift = val;
    } else if (key === "avatar" || key === "avatar_url" || key === "photo") {
      tableUpdates.avatar_url = val;
      metaUpdates.avatar_url = val;
    } else if (key === "role") {
      tableUpdates.role = val;
    }
  }

  // 1. Update user_metadata
  const { error: authErr } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: metaUpdates
  });
  if (authErr) {
    console.error("❌ Auth update failed:", authErr.message);
  } else {
    console.log("✅ Updated user metadata in Supabase Auth.");
  }

  // 2. Update profiles table
  if (Object.keys(tableUpdates).length > 0) {
    const { error: profErr } = await supabase.from("profiles").update(tableUpdates).eq("id", user.id);
    if (profErr) {
      console.warn("⚠️ Note on profiles table:", profErr.message);
      console.log("   (If columns do not exist in profiles table yet, metadata will be used as fallback)");
    } else {
      console.log("✅ Updated profiles table in Supabase Database.");
    }
  }

  console.log("\n🎉 Profile updated successfully! Here are the new values:");
  console.log({
    email: user.email,
    fullName: metaUpdates.full_name,
    assignedBay: metaUpdates.assigned_bay,
    station: metaUpdates.station,
    shift: metaUpdates.shift
  });
}

async function addProfile(email, password, fullName, role, bay = null, station = null, shift = null) {
  console.log(`\n➕ Creating new ${role} user: ${email}...`);

  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      assigned_bay: bay,
      station,
      shift
    }
  });

  if (authErr) {
    console.error("❌ Failed to create auth user:", authErr.message);
    return;
  }

  const userId = authData.user.id;
  console.log(`✅ Auth user created (ID: ${userId})`);

  // Insert into profiles table
  const profileRow = {
    id: userId,
    role,
    full_name: fullName,
    created_at: new Date().toISOString()
  };

  const { error: profErr } = await supabase.from("profiles").insert(profileRow);
  if (profErr) {
    console.warn("⚠️ Profiles table insert error:", profErr.message);
  } else {
    console.log("✅ Profile inserted into public.profiles table.");
  }

  console.log(`🎉 User ${email} created successfully!`);
}

async function runSql(query) {
  console.log(`\n⚡ Executing SQL Query:\n${query}\n`);
  const { data, error } = await supabase.rpc("exec_sql", { query });
  if (error) {
    console.error("❌ SQL execution failed:", error.message);
    console.log("\n💡 Tip: To run arbitrary SQL directly via RPC, execute this one-time script in Supabase SQL editor:");
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
    return;
  }
  console.log("✅ SQL executed successfully!", data || "");
}

// CLI Arg Parsing
const [, , command, ...args] = process.argv;

async function main() {
  switch (command) {
    case "list":
      await listUsers();
      break;

    case "update":
    case "update-loader": {
      const email = args[0];
      if (!email) {
        console.log("Usage: node scripts/db.js update <email> key=value key=value");
        console.log("Example: node scripts/db.js update load@waypoint.com bay=\"Bay 02\" station=\"Station #02\"");
        return;
      }
      const updates = {};
      for (const param of args.slice(1)) {
        const [k, v] = param.split("=");
        if (k && v) updates[k.replace(/^--/, "")] = v.replace(/^"|"$/g, "");
      }
      await updateProfile(email, updates);
      break;
    }

    case "add":
    case "add-user": {
      const [email, password, fullName, role, bay, station, shift] = args;
      if (!email || !password || password.length < 8 || !fullName || !role) {
        console.log("Usage: node scripts/db.js add <email> <password> <fullName> <role> [bay] [station] [shift]");
        console.log("Example: node scripts/db.js add loader2@waypoint.com '<min 8 char password>' \"Full Name\" loader \"Bay 02\" \"Station #02\"");
        return;
      }
      await addProfile(email, password, fullName, role, bay, station, shift);
      break;
    }

    case "sql":
    case "run-sql": {
      const sqlQuery = args.join(" ");
      if (!sqlQuery) {
        console.log("Usage: node scripts/db.js sql \"<your sql query>\"");
        return;
      }
      await runSql(sqlQuery);
      break;
    }

    default:
      console.log(`
Waypoint Database & User Management CLI
---------------------------------------
Commands:
  node scripts/db.js list
      List all Supabase users, profiles, and bay assignments

  node scripts/db.js update <email> bay="Bay 02" station="Station #02" shift="Night Shift"
      Update any loader's assigned bay, station, shift, or name

  node scripts/db.js add <email> <password> <fullName> <role> [bay] [station] [shift]
      Create a new user and profile directly in Supabase

  node scripts/db.js sql "<SQL Query>"
      Run raw SQL via Supabase RPC
      `);
      break;
  }
}

main().catch(console.error);
