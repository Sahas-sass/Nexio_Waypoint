import { PalletItem, PastLogEntry, StopGroup, TripVehicle } from "../types";
import { getVehicleImage } from "./vehicleImage";

// ---------------------------------------------------------------------------
// Raw Supabase row shapes (only the columns the loader selects)
// ---------------------------------------------------------------------------

type OneOrMany<T> = T | T[] | null | undefined;

export interface VehicleRow {
  id?: string;
  registration_number: string | null;
  vehicle_type: string | null;
  max_weight_kg: number | string | null;
  is_refrigerated: boolean | null;
}

export interface TripRow {
  id: string;
  trip_number: string;
  bay: string | null;
  status: string;
  departure_time: string | null;
  cutoff_time: string | null;
  vehicles?: OneOrMany<VehicleRow>;
  driver?: OneOrMany<{ id?: string; full_name: string | null; phone: string | null }>;
}

export interface StopRow {
  id: string;
  trip_id: string;
  stop_sequence: number;
  order_id: string | null;
  store_id: string | null;
  stores?: OneOrMany<{ id: string; name: string | null; address: string | null }>;
}

export interface PalletRow {
  id: string;
  trip_id: string;
  stop_id: string | null;
  order_id: string | null;
  sku: string;
  name: string;
  category: string;
  temp_req: string | null;
  weight_kg: number | string;
  is_verified: boolean | null;
  verified_at: string | null;
}

export interface LoadingLogRow {
  id: string;
  trip_number: string;
  bay: string;
  plate_number: string;
  vehicle_model: string;
  vehicle_type: string;
  driver_name: string;
  driver_phone: string | null;
  dispatched_at: string;
  shift: string | null;
  seal_number: string;
  total_pallets: number;
  verified_pallets: number;
  total_weight_kg: number | string;
  stores_count: number;
  stores_summary: string | null;
  status: string;
  signature: string;
  has_discrepancy: boolean | null;
  discrepancy_note: string | null;
}

/** Supabase embeds can come back as an object or a single-element array. */
export function firstOf<T>(value: OneOrMany<T>): T | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

/** Maps a DB trip status to the loader-facing badge text. */
export function deriveStatusText(status: string): string {
  switch (status) {
    case "loading":
      return "LOADING IN PROGRESS";
    case "ready":
    case "planning":
      return "READY TO LOAD";
    case "dispatched":
    case "en_route":
      return "SEALED & DISPATCHED";
    case "completed":
      return "COMPLETED";
    default:
      return "SCHEDULED";
  }
}

export function mapPallet(p: PalletRow, stop: StopRow): PalletItem {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category as PalletItem["category"],
    tempReq: p.temp_req ?? undefined,
    weightKg: Number(p.weight_kg) || 0,
    verified: Boolean(p.is_verified),
    verifiedAt: p.verified_at ?? undefined,
    orderId: p.order_id ?? stop.order_id ?? undefined,
    stopId: stop.id,
  };
}

/** A pallet belongs to a stop when linked by stop_id, or (unlinked) by the stop's order. */
export function palletBelongsToStop(p: PalletRow, stop: StopRow): boolean {
  if (p.stop_id) return p.stop_id === stop.id;
  return Boolean(p.order_id) && p.order_id === stop.order_id;
}

/**
 * Builds the stop groups of a trip in reverse-loading (LIFO) order:
 * the last delivery stop is loaded first (loadSequence 1).
 */
export function buildStopGroups(tripStops: StopRow[], pallets: PalletRow[]): StopGroup[] {
  const total = tripStops.length;
  return tripStops
    .map((stop) => {
      const store = firstOf(stop.stores);
      const storeId = stop.store_id ?? store?.id ?? undefined;
      return {
        stopId: stop.id,
        stopNumber: stop.stop_sequence,
        loadSequence: total - stop.stop_sequence + 1,
        storeId: storeId ? storeId.slice(0, 7).toUpperCase() : "",
        storeName: store?.name ?? "Unknown store",
        location: store?.address ?? "",
        orderId: stop.order_id ?? undefined,
        rawStoreId: storeId,
        pallets: pallets.filter((p) => palletBelongsToStop(p, stop)).map((p) => mapPallet(p, stop)),
      };
    })
    .sort((a, b) => a.loadSequence - b.loadSequence);
}

export function mapTrip(t: TripRow, stops: StopRow[], pallets: PalletRow[]): TripVehicle {
  const vehicle = firstOf(t.vehicles);
  const driver = firstOf(t.driver);
  const plateNumber = vehicle?.registration_number ?? "Unassigned";
  const vehicleType = vehicle?.vehicle_type ?? "No vehicle assigned";
  const maxWeightKg = Number(vehicle?.max_weight_kg) || 0;

  const stopGroups = buildStopGroups(
    stops.filter((s) => s.trip_id === t.id),
    pallets.filter((p) => p.trip_id === t.id)
  );
  const totalWeightKg = stopGroups.flatMap((s) => s.pallets).reduce((sum, p) => sum + p.weightKg, 0);

  return {
    id: t.id,
    tripNumber: t.trip_number,
    bay: t.bay ?? "",
    status: t.status as TripVehicle["status"],
    statusText: deriveStatusText(t.status),
    plateNumber,
    vehicleModel: vehicle ? `${plateNumber} (${vehicleType})` : vehicleType,
    vehicleType,
    driverName: driver?.full_name ?? "Unassigned driver",
    driverPhone: driver?.phone ?? "",
    departureTime: t.departure_time ?? "",
    cutoffTime: t.cutoff_time ?? "",
    maxWeightTons: Number((maxWeightKg / 1000).toFixed(1)),
    currentWeightTons: Number((totalWeightKg / 1000).toFixed(2)),
    image: getVehicleImage({ vehicleType: vehicle?.vehicle_type, isRefrigerated: vehicle?.is_refrigerated }),
    stops: stopGroups,
  };
}

export function formatLogTimestamp(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function mapLoadingLog(d: LoadingLogRow): PastLogEntry {
  return {
    id: d.id,
    tripNumber: d.trip_number,
    bay: d.bay,
    plateNumber: d.plate_number,
    vehicleModel: d.vehicle_model,
    vehicleType: d.vehicle_type,
    driverName: d.driver_name,
    driverPhone: d.driver_phone ?? "",
    dispatchedAt: formatLogTimestamp(d.dispatched_at),
    dispatchedAtIso: d.dispatched_at,
    shift: d.shift ?? "",
    sealNumber: d.seal_number,
    totalPallets: d.total_pallets,
    verifiedPallets: d.verified_pallets,
    totalWeightKg: Number(d.total_weight_kg) || 0,
    storesCount: d.stores_count,
    storesSummary: d.stores_summary ?? "",
    status: d.status as PastLogEntry["status"],
    signature: d.signature,
    hasDiscrepancy: Boolean(d.has_discrepancy),
    discrepancyNote: d.discrepancy_note ?? undefined,
  };
}
