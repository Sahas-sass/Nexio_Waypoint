// Pure row → domain mappers for Supabase query results.
import type { DispatcherOrder, OrderPriority, PlanningVehicle, TemperatureReq } from "../services/types";
import { getStoreInitial, one, shortTime } from "./format";
import { getVehicleImage } from "./vehicleImage";

export interface StoreRow {
  name: string | null;
  district?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  is_van_only?: boolean | null;
  delivery_window_start?: string | null;
  delivery_window_end?: string | null;
}

export interface OrderRow {
  id: string;
  order_number: string | null;
  store_id: string;
  total_weight_kg: number | string | null;
  total_volume_m3: number | string | null;
  temp_requirement: string | null;
  priority: string | null;
  delivery_window: string | null;
  target_delivery_date: string | null;
  item_count?: number | null;
  stores?: StoreRow | StoreRow[] | null;
}

export interface LoadRow {
  total_weight_kg: number | string | null;
  total_volume_m3: number | string | null;
}

export interface VehicleTripRow {
  trip_number: string | null;
  departure_time: string | null;
  driver?: { full_name: string | null } | { full_name: string | null }[] | null;
  trip_stops?: { orders: LoadRow | LoadRow[] | null }[] | null;
}

export interface VehicleRow {
  id: string;
  registration_number: string;
  vehicle_type: string | null;
  max_weight_kg: number | string | null;
  max_volume_m3: number | string | null;
  is_refrigerated: boolean | null;
}

export function toNumber(value: number | string | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function mapOrderRow(row: OrderRow): DispatcherOrder {
  const store = one(row.stores);
  const storeName = store?.name ?? "Unknown store";
  return {
    id: row.id,
    orderNumber: row.order_number ?? row.id.slice(0, 8),
    storeId: row.store_id,
    storeName,
    storeInitial: getStoreInitial(store?.name),
    storeDistrict: store?.district ?? null,
    storeLat: toNullableNumber(store?.latitude),
    storeLng: toNullableNumber(store?.longitude),
    isVanOnly: Boolean(store?.is_van_only),
    windowStart: shortTime(store?.delivery_window_start),
    windowEnd: shortTime(store?.delivery_window_end),
    totalWeightKg: toNumber(row.total_weight_kg),
    totalVolumeM3: toNumber(row.total_volume_m3),
    itemCount: row.item_count ?? null,
    tempRequirement: (row.temp_requirement === "chilled" ? "chilled" : "ambient") as TemperatureReq,
    priority: (["High", "Standard", "Low"].includes(row.priority ?? "") ? row.priority : "Standard") as OrderPriority,
    deliveryWindow: row.delivery_window ?? windowLabel(store),
    targetDeliveryDate: row.target_delivery_date ?? "",
  };
}

function windowLabel(store: StoreRow | null): string {
  const s = shortTime(store?.delivery_window_start);
  const e = shortTime(store?.delivery_window_end);
  if (s && e) return `${s} - ${e}`;
  return "No window set";
}

/** Sums the order load already placed on the given trips. */
export function committedLoad(trips: VehicleTripRow[]): { weightKg: number; volumeM3: number } {
  let weightKg = 0;
  let volumeM3 = 0;
  for (const trip of trips) {
    for (const stop of trip.trip_stops ?? []) {
      const order = one(stop.orders);
      weightKg += toNumber(order?.total_weight_kg);
      volumeM3 += toNumber(order?.total_volume_m3);
    }
  }
  return { weightKg, volumeM3 };
}

/** Converts "06:30 AM" / "06:30" into 24h "HH:MM"; null when unparsable. */
export function to24h(value: string | null | undefined): string | null {
  if (!value) return null;
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i.exec(value.trim());
  if (!m) return null;
  let h = Number(m[1]);
  const ampm = m[3]?.toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

export function mapVehicleRow(row: VehicleRow, trips: VehicleTripRow[]): PlanningVehicle {
  const load = committedLoad(trips);
  const firstTrip = trips[0];
  return {
    id: row.id,
    plateNumber: row.registration_number,
    vehicleType: row.vehicle_type ?? "",
    maxWeightKg: toNumber(row.max_weight_kg),
    maxVolumeM3: toNumber(row.max_volume_m3),
    isRefrigerated: Boolean(row.is_refrigerated),
    image: getVehicleImage({ vehicleType: row.vehicle_type, isRefrigerated: row.is_refrigerated }),
    committedWeightKg: load.weightKg,
    committedVolumeM3: load.volumeM3,
    departureTime: to24h(firstTrip?.departure_time),
    driverName: one(firstTrip?.driver)?.full_name ?? null,
    tripNumber: firstTrip?.trip_number ?? null,
  };
}
