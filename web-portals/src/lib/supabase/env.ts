/** Reads the public Supabase settings; throws when they are not configured. */
export function getSupabasePublicEnv(env: Record<string, string | undefined> = process.env): {
  url: string;
  anonKey: string;
} {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set");
  }
  return { url, anonKey };
}

/** Reads the server-only service key; throws when it is not configured. Never import from client code. */
export function getSupabaseServiceKey(env: Record<string, string | undefined> = process.env): string {
  const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_KEY must be set on the server");
  return key;
}
