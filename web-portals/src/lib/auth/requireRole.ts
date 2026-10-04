import type { SupabaseClient, User } from "@supabase/supabase-js";

export type AuthResult =
  | { ok: true; user: User; role: string }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Resolves the signed-in user (validated with the Auth server) and their profile role.
 * Pass `allowedRoles` to restrict access; an empty list allows any signed-in user.
 */
export async function requireRole(supabase: SupabaseClient, allowedRoles: readonly string[] = []): Promise<AuthResult> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { ok: false, status: 401, error: "Not signed in" };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = profile?.role as string | undefined;
  if (profileError || !role) return { ok: false, status: 403, error: "No profile for this account" };

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return { ok: false, status: 403, error: "Not allowed for your role" };
  }
  return { ok: true, user, role };
}
