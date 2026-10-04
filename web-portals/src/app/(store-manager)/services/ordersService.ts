import { supabase } from "@/lib/supabaseClient";
import type { Order, PlaceOrderInput } from "../types";
import { unwrap } from "../utils/errors";

export const ORDER_COLUMNS =
  "id, order_number, status, target_delivery_date, temp_requirement, total_weight_kg, total_volume_m3, item_count, priority, delivery_window, deferral_reason, deferred_at, rescheduled_run, notes, created_at";

export async function fetchStoreOrders(storeId: string): Promise<Order[]> {
  const result = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });
  return unwrap(result, []) as Order[];
}

/** Places an order through the place_order RPC (server enforces role, store and cutoff). */
export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const result = await supabase.rpc("place_order", {
    p_target_date: input.targetDate,
    p_temp: input.temp,
    p_weight_kg: input.weightKg,
    p_volume_m3: input.volumeM3,
    p_item_count: input.itemCount,
    p_priority: input.priority,
    p_notes: input.notes,
  });
  return unwrap(result) as Order;
}
