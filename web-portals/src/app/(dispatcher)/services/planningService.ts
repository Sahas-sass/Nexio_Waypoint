import { supabase } from "@/lib/supabaseClient";
import type { DispatcherOrder, PlanningVehicle } from "./types";
import { mapOrderRow, mapVehicleRow, type OrderRow, type VehicleTripRow } from "../utils/mappers";
import type { AllocationResult } from "../utils/allocation";
import { submitDeferrals } from "./deferralService";

export const ORDER_SELECT = `
  id, order_number, store_id, total_weight_kg, total_volume_m3, temp_requirement,
  priority, delivery_window, target_delivery_date, item_count,
  stores:store_id ( name, district, latitude, longitude, is_van_only, delivery_window_start, delivery_window_end )
`;

/** Pending (unallocated) orders for a delivery date. */
export async function fetchPendingOrders(targetDate: string): Promise<DispatcherOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("status", "pending")
    .eq("target_delivery_date", targetDate)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as OrderRow[]).map(mapOrderRow);
}

/** Active vehicles with the load already committed on their trips for the date. */
export async function fetchPlanningVehicles(targetDate: string): Promise<PlanningVehicle[]> {
  const [vehiclesRes, tripsRes] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, registration_number, vehicle_type, max_weight_kg, max_volume_m3, is_refrigerated")
      .eq("is_active", true)
      .order("registration_number", { ascending: true }),
    supabase
      .from("trips")
      .select("vehicle_id, trip_number, departure_time, driver:driver_id ( full_name ), trip_stops ( orders:order_id ( total_weight_kg, total_volume_m3 ) )")
      .eq("trip_date", targetDate),
  ]);
  if (vehiclesRes.error) throw new Error(vehiclesRes.error.message);
  if (tripsRes.error) throw new Error(tripsRes.error.message);

  const tripsByVehicle = new Map<string, VehicleTripRow[]>();
  for (const trip of (tripsRes.data ?? []) as unknown as (VehicleTripRow & { vehicle_id: string })[]) {
    const list = tripsByVehicle.get(trip.vehicle_id) ?? [];
    list.push(trip);
    tripsByVehicle.set(trip.vehicle_id, list);
  }
  return (vehiclesRes.data ?? []).map((v) => mapVehicleRow(v, tripsByVehicle.get(v.id) ?? []));
}

/**
 * Persists an allocation: defers leftover orders, creates/extends a planning
 * trip per used vehicle (publish_vehicle_plan RPC: trip, stops in window order and
 * order status in one transaction).
 */
export async function publishAllocation(
  targetDate: string,
  result: AllocationResult,
  deferredBy?: string,
): Promise<{ tripsCount: number; assignedCount: number; deferredCount: number }> {
  const byReason = new Map<string, DispatcherOrder[]>();
  for (const d of result.deferred) {
    byReason.set(d.reason, [...(byReason.get(d.reason) ?? []), d.order]);
  }
  for (const [reason, orders] of byReason) {
    await submitDeferrals({ orders, reason, rescheduledRun: "Next available run", deferredBy });
  }

  const used = result.plans.filter((p) => p.orders.length > 0);
  for (const plan of used) {
    // One transaction per vehicle: trip + stops + order status, constraints re-checked server-side
    const { error } = await supabase.rpc("publish_vehicle_plan", {
      p_vehicle_id: plan.vehicle.id,
      p_trip_date: targetDate,
      p_order_ids: plan.orders.map((o) => o.id),
    });
    if (error) throw new Error(`Could not publish plan for ${plan.vehicle.plateNumber}: ${error.message}`);
  }

  return { tripsCount: used.length, assignedCount: result.assignedCount, deferredCount: result.deferred.length };
}
