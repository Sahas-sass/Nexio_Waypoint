/**
 * Builds the node-postgres connection config for the Supabase database from env vars.
 * Uses DATABASE_URL when set; otherwise DB_PASSWORD + DB_HOST/DB_PORT/DB_USER/DB_NAME.
 * DB_USER defaults to the Supabase pooler user "postgres.<project-ref>" derived from SUPABASE_URL.
 */
function projectRefFromUrl(url) {
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    return host.endsWith(".supabase.co") ? host.split(".")[0] : null;
  } catch {
    return null;
  }
}

function getPgConfig(env = process.env) {
  const ssl = { rejectUnauthorized: false };
  if (env.DATABASE_URL) {
    return { connectionString: env.DATABASE_URL, ssl, connectionTimeoutMillis: 10000 };
  }
  const password = env.DB_PASSWORD || env.SUPABASE_DB_PASSWORD;
  if (!password) {
    throw new Error("Set DATABASE_URL or DB_PASSWORD to connect to the database.");
  }
  const ref = projectRefFromUrl(env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL);
  const user = env.DB_USER || (ref ? `postgres.${ref}` : null);
  if (!user) {
    throw new Error("Set DB_USER (or SUPABASE_URL so it can be derived).");
  }
  return {
    host: env.DB_HOST || "aws-0-ap-northeast-1.pooler.supabase.com",
    port: parseInt(env.DB_PORT || "5432", 10),
    user,
    password,
    database: env.DB_NAME || "postgres",
    ssl,
    connectionTimeoutMillis: 10000,
  };
}

module.exports = { getPgConfig, projectRefFromUrl };
