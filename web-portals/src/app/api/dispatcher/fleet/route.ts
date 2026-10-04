import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/requireRole";
import {
  computeKpis,
  mapRouteException,
  mapTripToVehicle,
  type FleetExceptionRow,
  type FleetTripRow,
} from "@/lib/fleet/mapFleet";

const TRIP_COLUMNS = `
  id, trip_number, status, current_district, current_lat, current_lng,
  delay_minutes, connection_status, eta_time, last_ping_at,
  vehicles:vehicle_id ( registration_number, vehicle_type, is_refrigerated ),
  driver:driver_id ( full_name ),
  trip_stops ( id, stop_sequence, status, stores:store_id ( name, address, latitude, longitude ) )
`;

/** Live fleet snapshot for the dispatcher tracking map. Runs as the signed-in dispatcher (RLS applies). */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const auth = await requireRole(supabase, ["dispatcher"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const [trips, exceptions] = await Promise.all([
    supabase.from("trips").select(TRIP_COLUMNS).eq("status", "en_route").order("trip_number"),
    supabase.from("route_exceptions").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  const error = trips.error ?? exceptions.error;
  if (error) {
    console.error("[api/dispatcher/fleet] query failed:", error.message);
    return NextResponse.json({ success: false, error: "Could not load fleet data" }, { status: 500 });
  }

  const now = new Date();
  const vehicles = ((trips.data ?? []) as unknown as FleetTripRow[])
    .map((t) => mapTripToVehicle(t, now))
    .filter((v) => v !== null);

  return NextResponse.json({
    success: true,
    vehicles,
    kpis: computeKpis(vehicles),
    exceptions: ((exceptions.data ?? []) as FleetExceptionRow[]).map(mapRouteException),
  });
}
