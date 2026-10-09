import { supabase } from "@/lib/supabaseClient";
import type { LiveTrackingVehicle, RouteExceptionEvent, TrackingKPIs } from "./types";
import {
  computeTrackingKpis,
  mapRouteException,
  mapTripToTrackingVehicle,
  type RouteExceptionRow,
  type TrackingTripRow,
} from "../utils/tracking";

const TRIP_SELECT = `
  id, trip_number, status, current_district, current_lat, current_lng, delay_minutes,
  connection_status, eta_time, last_ping_at,
  vehicles:vehicle_id ( registration_number, vehicle_type, is_refrigerated ),
  driver:driver_id ( full_name ),
  trip_stops ( id, stop_sequence, status, stores:store_id ( name, address, latitude, longitude ) )
`;

/** Trips currently on the road with their latest telemetry. */
export async function fetchLiveTrackingFleet(): Promise<{ vehicles: LiveTrackingVehicle[]; kpis: TrackingKPIs }> {
  const { data, error } = await supabase
    .from("trips")
    .select(TRIP_SELECT)
    .eq("status", "en_route")
    .order("trip_number", { ascending: true });
  if (error) throw new Error(error.message);
  const now = new Date();
  const vehicles = ((data ?? []) as unknown as TrackingTripRow[])
    .map((t) => mapTripToTrackingVehicle(t, now))
    .filter((v): v is LiveTrackingVehicle => v !== null);
  return { vehicles, kpis: computeTrackingKpis(vehicles) };
}

export async function fetchRouteExceptions(limit = 20): Promise<RouteExceptionEvent[]> {
  const { data, error } = await supabase
    .from("route_exceptions")
    .select("id, trip_id, vehicle_id, vehicle_plate, event_time, event_type, title, description, severity, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data ?? []) as RouteExceptionRow[]).map(mapRouteException);
}

/** Realtime listener for trip telemetry and new route exceptions. Returns an unsubscribe fn. */
export function subscribeToTelemetry(
  onTripUpdate: () => void,
  onException: (event: RouteExceptionEvent) => void,
): () => void {
  const channel = supabase
    .channel("dispatcher-realtime-telemetry")
    .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, () => onTripUpdate())
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "route_exceptions" }, (payload) => {
      onException(mapRouteException(payload.new as RouteExceptionRow));
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
