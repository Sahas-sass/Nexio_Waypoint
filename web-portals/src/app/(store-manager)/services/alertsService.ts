import { supabase } from "@/lib/supabaseClient";
import type { DeferralLog, StoreException } from "../types";
import { unwrap } from "../utils/errors";

export async function fetchDeferralLogs(storeId: string): Promise<DeferralLog[]> {
  const result = await supabase
    .from("deferral_logs")
    .select("id, order_id, order_number, reason, rescheduled_run, deferred_at, notes")
    .eq("store_id", storeId)
    .order("deferred_at", { ascending: false });
  return unwrap(result, []) as DeferralLog[];
}

export async function fetchStoreExceptions(storeId: string): Promise<StoreException[]> {
  const result = await supabase
    .from("exceptions")
    .select("id, order_id, reason_code, action_taken, is_read, created_at")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });
  return unwrap(result, []) as StoreException[];
}
