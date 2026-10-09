import type {
  ConnectionStatus,
  LiveTrackingVehicle,
  RouteExceptionEvent,
  TrackingKPIs,
} from "@/app/(dispatcher)/services/types";
import { getVehicleImage } from "./vehicleImage";

type MaybeArray<T> = T | T[] | null | undefined;

export interface FleetStoreRow {
  name: string | null;
  address: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
}

export interface FleetTripRow {
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
  vehicles?: MaybeArray<{ registration_number: string; vehicle_type: string | null; is_refrigerated: boolean | null }>;
  driver?: MaybeArray<{ full_name: string | null }>;
  trip_stops?: { id: string; stop_sequence: number | null; status: string | null; stores: MaybeArray<FleetStoreRow> }[] | null;
}

export interface FleetExceptionRow {
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

const one = <T>(value: MaybeArray<T>): T | null => (Array.isArray(value) ? value[0] ?? null : value ?? null);

const toCoord = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** Human readable "Last update N min ago" relative to `now`. */
export function lastUpdateText(lastPingAt: string | null, now: Date): string {
  const t = lastPingAt ? Date.parse(lastPingAt) : NaN;
  if (Number.isNaN(t)) return "No update received";
  const minutes = Math.max(0, Math.round((now.getTime() - t) / 60000));
  if (minutes < 60) return `Last update ${minutes} min ago`;
  return `Last update ${Math.round(minutes / 60)} h ago`;
}

export function trackingStatus(conn: ConnectionStatus, delayMinutes: number): LiveTrackingVehicle["status"] {
  if (conn === "offline") return "connectivity-issue";
  if (delayMinutes > 0 || conn === "delayed") return "delayed";
  return "on-schedule";
}

/** Maps a trip row to a live-tracking vehicle; null when the trip has no GPS position yet. */
export function mapTripToVehicle(t: FleetTripRow, now: Date = new Date()): LiveTrackingVehicle | null {
  const lat = toCoord(t.current_lat);
  const lng = toCoord(t.current_lng);
  if (lat === null || lng === null) return null;

  const vehicle = one(t.vehicles);
  const conn = (["online", "delayed", "offline"].includes(t.connection_status ?? "")
    ? t.connection_status
    : "online") as ConnectionStatus;
  const delay = Number(t.delay_minutes) || 0;
  const status = trackingStatus(conn, delay);

  const stops = [...(t.trip_stops ?? [])]
    .sort((a, b) => (a.stop_sequence ?? 0) - (b.stop_sequence ?? 0))
    .flatMap((s) => {
      const store = one(s.stores);
      const sLat = toCoord(store?.latitude);
      const sLng = toCoord(store?.longitude);
      if (!store || sLat === null || sLng === null) return [];
      return [{
        id: s.id,
        sequence: s.stop_sequence ?? 0,
        storeName: store.name ?? "Unknown store",
        address: store.address ?? "",
        lat: sLat,
        lng: sLng,
        status: s.status ?? "PENDING",
      }];
    });

  const plate = vehicle?.registration_number ?? t.trip_number ?? t.id;
  return {
    id: t.id,
    tripId: t.id,
    name: plate,
    type: vehicle?.vehicle_type ?? "",
    driverName: one(t.driver)?.full_name ?? "Unassigned driver",
    stopsCount: t.trip_stops?.length ?? 0,
    status,
    statusText: STATUS_STYLE[status].text,
    etaOrUpdate:
      status === "connectivity-issue"
        ? lastUpdateText(t.last_ping_at, now)
        : t.eta_time
          ? `ETA ${t.eta_time}`
          : "ETA pending",
    image: getVehicleImage(vehicle),
    color: STATUS_STYLE[status].color,
    routeDistrict: t.current_district ?? "",
    lat,
    lng,
    delayMinutes: delay,
    connectionStatus: conn,
    lastPingAt: t.last_ping_at ?? "",
    stops,
  };
}

export function computeKpis(vehicles: LiveTrackingVehicle[]): TrackingKPIs {
  return {
    activeVehicles: vehicles.length,
    onSchedule: vehicles.filter((v) => v.status === "on-schedule").length,
    delayed: vehicles.filter((v) => v.status === "delayed").length,
    connectivityIssues: vehicles.filter((v) => v.status === "connectivity-issue").length,
  };
}

export function mapRouteException(r: FleetExceptionRow): RouteExceptionEvent {
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
