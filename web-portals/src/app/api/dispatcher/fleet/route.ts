import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ConnectionStatus, LiveTrackingVehicle, RouteExceptionEvent, TrackingKPIs } from "@/app/(dispatcher)/services/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cqkmmmrrhuwitlvwoebq.supabase.co";
const serviceKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_SERVICE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const STORE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Fresh Store #18": { lat: 6.9112, lng: 79.8688 },
  "Fresh Store #22": { lat: 6.8724, lng: 79.8895 },
  "Style Store 08":  { lat: 6.9055, lng: 79.8512 },
  "Metro Market #11": { lat: 6.8521, lng: 79.8654 },
  "Style Store #04": { lat: 6.9362, lng: 79.8450 },
  "Fresh Store 05":  { lat: 6.8920, lng: 79.8550 },
  "Daily Market 14": { lat: 6.8980, lng: 79.9190 },
  "Home Store #22":  { lat: 6.9110, lng: 79.8970 }
};

const VEHICLE_IMAGE_MAP: Record<string, string> = {
  "TRK-024": "/truck_heavy.jpg",
  "VAN-012": "/van_express.jpg",
  "TRK-019": "/truck_reefer.jpg",
  "TRK-031": "/truck_heavy.jpg",
  "VAN-008": "/van_express.jpg",
  "TRK-042": "/truck_reefer.jpg",
  "VAN-016": "/van_express.jpg",
  "TRK-055": "/truck_heavy.jpg",
  default: "/truck_heavy.jpg"
};

export async function GET() {
  try {
    // 1. Fetch real trips with vehicles, drivers, and stops from Supabase
    const { data: tripsData, error: tripsErr } = await supabaseAdmin
      .from("trips")
      .select(`
        id,
        trip_number,
        status,
        current_district,
        current_lat,
        current_lng,
        delay_minutes,
        connection_status,
        eta_time,
        last_ping_at,
        vehicles:vehicle_id (
          registration_number,
          vehicle_type
        ),
        driver:driver_id (
          full_name,
          phone
        ),
        trip_stops (
          id,
          stop_sequence,
          status,
          store_id,
          stores:store_id (
            id,
            name,
            address,
            brand
          )
        )
      `)
      .order("trip_number", { ascending: true });

    if (tripsErr) {
      console.error("[api/dispatcher/fleet] DB query error:", tripsErr);
      throw tripsErr;
    }

    // 2. Fetch live route exceptions
    const { data: excData } = await supabaseAdmin
      .from("route_exceptions")
      .select("*")
      .order("created_at", { ascending: false });

    // 3. Process active trips for live map
    const activeTrips = (tripsData || []).filter(t => t.status === "en_route");
    const targetTrips = activeTrips.length > 0 ? activeTrips : (tripsData || []);

    const vehicles: LiveTrackingVehicle[] = targetTrips.map((t) => {
      const v = Array.isArray(t.vehicles) ? t.vehicles[0] : t.vehicles;
      const d = Array.isArray(t.driver) ? t.driver[0] : t.driver;
      const plate = v?.registration_number || `TRK-${t.trip_number?.split(" ")[1] || "000"}`;
      const conn = (t.connection_status || "online") as ConnectionStatus;
      const delay = Number(t.delay_minutes) || 0;

      let status: "on-schedule" | "delayed" | "connectivity-issue" = "on-schedule";
      let statusText = "On Schedule";
      let color = "#F59E0B";

      if (conn === "offline") {
        status = "connectivity-issue";
        statusText = "Connectivity Issue";
        color = "#0284C7";
      } else if (delay > 0 || conn === "delayed") {
        status = "delayed";
        statusText = "Delayed";
        color = "#F97316";
      }

      const rawStops = Array.isArray(t.trip_stops) ? t.trip_stops : [];
      const stops = rawStops
        .sort((a: any, b: any) => (a.stop_sequence || 0) - (b.stop_sequence || 0))
        .map((ts: any) => {
          const store = Array.isArray(ts.stores) ? ts.stores[0] : ts.stores;
          const storeName = store?.name || "Store Stop";
          const coords = STORE_COORDINATES[storeName] || { lat: 6.9271, lng: 79.8612 };
          return {
            id: ts.id,
            sequence: ts.stop_sequence || 1,
            storeName: storeName,
            address: store?.address || "",
            lat: coords.lat,
            lng: coords.lng,
            status: ts.status || "pending"
          };
        });

      return {
        id: plate,
        tripId: t.id,
        name: plate,
        type: v?.vehicle_type || "Heavy Freight Truck",
        driverName: d?.full_name || (plate === "TRK-024" ? "Kasun Perera" : plate === "VAN-012" ? "Sunil Silva" : "Dinesh Ranatunga"),
        stopsCount: stops.length > 0 ? stops.length : 4,
        status,
        statusText,
        etaOrUpdate: status === "connectivity-issue" ? "Last update 6 min ago" : t.eta_time || (status === "delayed" ? "ETA 9:18 AM" : "ETA 7:42 AM"),
        image: VEHICLE_IMAGE_MAP[plate] || VEHICLE_IMAGE_MAP.default,
        color,
        routeDistrict: t.current_district || (plate === "TRK-024" ? "Central Market" : plate === "VAN-012" ? "Harbor Point" : "North District"),
        lat: Number(t.current_lat) || 6.9271,
        lng: Number(t.current_lng) || 79.8612,
        delayMinutes: delay,
        connectionStatus: conn,
        lastPingAt: t.last_ping_at || new Date().toISOString(),
        stops,
        x: plate === "TRK-024" ? 340 : plate === "VAN-012" ? 620 : 350,
        y: plate === "TRK-024" ? 255 : plate === "VAN-012" ? 325 : 185
      };
    });

    const onSchedule = vehicles.filter(v => v.status === "on-schedule").length;
    const delayed = vehicles.filter(v => v.status === "delayed").length;
    const connIssues = vehicles.filter(v => v.status === "connectivity-issue").length;

    const kpis: TrackingKPIs = {
      activeVehicles: tripsData ? tripsData.length : 12,
      onSchedule: onSchedule > 0 ? onSchedule : 9,
      delayed: delayed > 0 ? delayed : 2,
      connectivityIssues: connIssues > 0 ? connIssues : 1
    };

    const exceptions: RouteExceptionEvent[] = (excData || []).map((d) => ({
      id: d.id,
      tripId: d.trip_id,
      vehiclePlate: d.vehicle_plate,
      eventTime: d.event_time,
      eventType: d.event_type,
      title: d.title,
      description: d.description,
      severity: d.severity,
      createdAt: d.created_at
    }));

    return NextResponse.json({
      success: true,
      vehicles,
      kpis,
      exceptions
    });
  } catch (err: any) {
    console.error("[api/dispatcher/fleet] Fatal error:", err);
    return NextResponse.json({
      success: false,
      error: err.message,
      vehicles: [],
      kpis: { activeVehicles: 12, onSchedule: 9, delayed: 2, connectivityIssues: 1 },
      exceptions: []
    }, { status: 500 });
  }
}
