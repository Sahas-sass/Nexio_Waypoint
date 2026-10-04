import { supabase } from "@/lib/supabaseClient";
import type { CommandCenterData } from "./types";
import { ORDER_SELECT } from "./planningService";
import { buildCommandCenterData, type CommandTripRow } from "../utils/commandCenter";
import { mapOrderRow, type OrderRow } from "../utils/mappers";

/** KPIs for today's trips and the orders planned for `planningDate`. */
export async function fetchCommandCenterMetrics(today: string, planningDate: string): Promise<CommandCenterData> {
  const [ordersRes, deferredRes, vehiclesRes, tripsRes] = await Promise.all([
    supabase
      .from("orders")
      .select(`status, ${ORDER_SELECT}`)
      .eq("target_delivery_date", planningDate)
      .neq("status", "deferred")
      .order("created_at", { ascending: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "deferred"),
    supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("trips")
      .select(`id, status, trip_number, departure_time, eta_time, delay_minutes,
        vehicles:vehicle_id ( id, registration_number, vehicle_type, max_weight_kg, max_volume_m3, is_refrigerated ),
        trip_stops ( orders:order_id ( total_weight_kg, total_volume_m3 ) )`)
      .eq("trip_date", today)
      .order("trip_number", { ascending: true }),
  ]);
  for (const res of [ordersRes, deferredRes, vehiclesRes, tripsRes]) {
    if (res.error) throw new Error(res.error.message);
  }

  const plannedOrders = ((ordersRes.data ?? []) as unknown as (OrderRow & { status: string })[]).map((row) => ({
    ...mapOrderRow(row),
    status: row.status,
  }));

  return buildCommandCenterData({
    planningDate,
    plannedOrders,
    deferredCount: deferredRes.count ?? 0,
    activeVehicleCount: vehiclesRes.count ?? 0,
    todaysTrips: (tripsRes.data ?? []) as unknown as CommandTripRow[],
  });
}
