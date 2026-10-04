import { supabase } from "@/lib/supabaseClient";
import type { DeferralSubmissionPayload } from "./types";

/** Marks orders deferred and writes an audit row per order to deferral_logs. */
export async function submitDeferrals(payload: DeferralSubmissionPayload): Promise<{ count: number }> {
  const { orders, reason, rescheduledRun, notes, deferredBy } = payload;
  if (orders.length === 0) return { count: 0 };
  if (!reason.trim() || !rescheduledRun.trim()) throw new Error("Reason and rescheduled run are required");

  const deferredAt = new Date().toISOString();
  const { error: updateErr } = await supabase
    .from("orders")
    .update({
      status: "deferred",
      deferral_reason: reason,
      rescheduled_run: rescheduledRun,
      deferred_at: deferredAt,
      store_notified: true,
    })
    .in("id", orders.map((o) => o.id));
  if (updateErr) throw new Error(updateErr.message);

  const { error: logErr } = await supabase.from("deferral_logs").insert(
    orders.map((o) => ({
      order_id: o.id,
      order_number: o.orderNumber,
      store_id: o.storeId,
      store_name: o.storeName,
      priority: o.priority,
      volume_m3: o.totalVolumeM3,
      weight_kg: o.totalWeightKg,
      delivery_window: o.deliveryWindow,
      reason,
      rescheduled_run: rescheduledRun,
      deferred_by: deferredBy ?? null,
      deferred_at: deferredAt,
      notes: notes ?? null,
      store_notified: true,
    })),
  );
  if (logErr) throw new Error(logErr.message);

  return { count: orders.length };
}
