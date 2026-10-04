// Pure mapping of trip telemetry rows into live-tracking view models.
import type { ConnectionStatus, LiveTrackingVehicle, RouteExceptionEvent, TrackingKPIs } from "../services/types";
import { one, timeAgo } from "./format";
import { toNumber } from "./mappers";
import { getVehicleImage } from "./vehicleImage";

interface TrackingStoreRow {
  name: string | null;
  address: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
}

export interface TrackingTripRow {
  id: string;
  trip_number: string | null;
  status: string | null;
  current_district: string | null;
  current_lat: number | string | null;
  current_lng: number | string | null;
  delay_minutes: number | null;
  connection_status: string | null;
  eta_time: string | null;
  last_ping_at: string | null;
  vehicles?: { registration_number: string; vehicle_type: string | null; is_refrigerated: boolean | null } | { registration_number: string; vehicle_type: string | null; is_refrigerated: boolean | null }[] | null;
  driver?: { full_name: string | null } | { full_name: string | null }[] | null;
  trip_stops?: {
    id: string;
    stop_sequence: number | null;
    status: string | null;
    stores: TrackingStoreRow | TrackingStoreRow[] | null;
  }[] | null;
}

export interface RouteExceptionRow {
  id: string;
  trip_id: string | null;
  vehicle_id: string | null;
  vehicle_plate: string;
  event_time: string;
  event_type: RouteExceptionEvent["eventType"];
  title: string;
  description: string;
  severity: RouteExceptionEvent["severity"] | null;
  created_at: string;
}

const STATUS_STYLE = {
  "on-schedule": { text: "On Schedule", color: "#F59E0B" },
  delayed: { text: "Delayed", color: "#F97316" },
  "connectivity-issue": { text: "Connectivity Issue", color: "#0284C7" },
} as const;

export function trackingStatus(conn: ConnectionStatus, delayMinutes: number): LiveTrackingVehicle["status"] {
  if (conn === "offline") return "connectivity-issue";
  if (delayMinutes > 0 || conn === "delayed") return "delayed";
  return "on-schedule";
}

/** Maps a trip row; returns null when the trip has no GPS position yet. */
export function mapTripToTrackingVehicle(t: TrackingTripRow, now: Date = new Date()): LiveTrackingVehicle | null {
  if (t.current_lat == null || t.current_lng == null) return null;
  const v = one(t.vehicles);
  const d = one(t.driver);
  const conn = (["online", "delayed", "offline"].includes(t.connection_status ?? "") ? t.connection_status : "online") as ConnectionStatus;
  const delay = toNumber(t.delay_minutes);
  const status = trackingStatus(conn, delay);
  const plate = v?.registration_number ?? t.trip_number ?? t.id.slice(0, 8);

  const stops = [...(t.trip_stops ?? [])]
    .sort((a, b) => (a.stop_sequence ?? 0) - (b.stop_sequence ?? 0))
    .flatMap((s) => {
      const store = one(s.stores);
      if (store?.latitude == null || store?.longitude == null) return [];
      return [{
        id: s.id,
        sequence: s.stop_sequence ?? 0,
        storeName: store.name ?? "Unknown store",
        address: store.address ?? "",
        lat: toNumber(store.latitude),
        lng: toNumber(store.longitude),
        status: s.status ?? "PENDING",
      }];
    });

  return {
    id: t.id,
    tripId: t.id,
    name: plate,
    type: v?.vehicle_type ?? "",
    driverName: d?.full_name ?? "Unassigned driver",
    stopsCount: t.trip_stops?.length ?? 0,
    status,
    statusText: STATUS_STYLE[status].text,
    etaOrUpdate: status === "connectivity-issue" ? timeAgo(t.last_ping_at, now) : t.eta_time ? `ETA ${t.eta_time}` : "ETA pending",
    image: getVehicleImage({ vehicleType: v?.vehicle_type, isRefrigerated: v?.is_refrigerated }),
    color: STATUS_STYLE[status].color,
    routeDistrict: t.current_district ?? "",
    lat: toNumber(t.current_lat),
    lng: toNumber(t.current_lng),
    delayMinutes: delay,
    connectionStatus: conn,
    lastPingAt: t.last_ping_at ?? "",
    stops,
  };
}

export function computeTrackingKpis(vehicles: LiveTrackingVehicle[]): TrackingKPIs {
  return {
    activeVehicles: vehicles.length,
    onSchedule: vehicles.filter((v) => v.status === "on-schedule").length,
    delayed: vehicles.filter((v) => v.status === "delayed").length,
    connectivityIssues: vehicles.filter((v) => v.status === "connectivity-issue").length,
  };
}

/** Mean delay (minutes, rounded) of delayed vehicles; 0 when none. */
export function averageDelay(vehicles: LiveTrackingVehicle[]): number {
  const delayed = vehicles.filter((v) => v.delayMinutes > 0);
  if (delayed.length === 0) return 0;
  return Math.round(delayed.reduce((s, v) => s + v.delayMinutes, 0) / delayed.length);
}

/** Most recent ping among the given vehicles (ISO) or null. */
export function latestPing(vehicles: LiveTrackingVehicle[]): string | null {
  const times = vehicles.map((v) => Date.parse(v.lastPingAt)).filter((n) => !Number.isNaN(n));
  return times.length ? new Date(Math.max(...times)).toISOString() : null;
}

export function mapRouteException(r: RouteExceptionRow): RouteExceptionEvent {
  return {
    id: r.id,
    tripId: r.trip_id ?? undefined,
    vehicleId: r.vehicle_id ?? undefined,
    vehiclePlate: r.vehicle_plate,
    eventTime: r.event_time,
    eventType: r.event_type,
    title: r.title,
    description: r.description,
    severity: r.severity ?? "info",
    createdAt: r.created_at,
  };
}
