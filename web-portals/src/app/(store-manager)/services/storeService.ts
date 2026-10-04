import { supabase } from "@/lib/supabaseClient";
import type { Store, StoreContextData } from "../types";
import { unwrap } from "../utils/errors";

const STORE_COLUMNS =
  "id, name, brand, address, district, access_conditions, delivery_window_start, delivery_window_end, is_van_only";

/** Loads the signed-in store manager's profile and assigned store. */
export async function fetchStoreContext(): Promise<StoreContextData> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth?.user) throw new Error("You are not signed in.");

  const profile = unwrap(
    await supabase.from("profiles").select("full_name, role, store_id").eq("id", auth.user.id).maybeSingle(),
    null,
  ) as { full_name: string | null; role: string; store_id: string | null } | null;
  if (!profile || profile.role !== "store_manager") throw new Error("This portal is only available to store managers.");
  if (!profile.store_id) throw new Error("No store is assigned to your account. Contact dispatch.");

  const store = unwrap(
    await supabase.from("stores").select(STORE_COLUMNS).eq("id", profile.store_id).maybeSingle(),
    null,
  ) as Store | null;
  if (!store) throw new Error("Your assigned store could not be found.");

  return { userId: auth.user.id, fullName: profile.full_name, store };
}
