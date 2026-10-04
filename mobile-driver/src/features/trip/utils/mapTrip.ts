import { formatWindow } from '@/utils/formatters';

import type { DriverProfile, StopStatus, TempRequirement, Trip, TripStop, Vehicle } from '../types';

/* Row shapes returned by the Supabase select in tripService (only the columns we read). */
export interface ProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  employee_id: string | null;
  station?: string | null;
  shift?: string | null;
  avatar_url: string | null;
}

export interface VehicleRow {
  id: string;
  registration_number: string;
  vehicle_type: string | null;
  is_refrigerated: boolean | null;
  max_weight_kg: number | null;
}

export interface StopRow {
  id: string;
  stop_sequence: number;
  status: string | null;
  estimated_arrival: string | null;
  completed_at: string | null;
  order: {
    id: string;
    order_number: string | null;
    item_count: number | null;
    total_weight_kg: number | null;
    total_volume_m3: number | null;
    temp_requirement: string | null;
    delivery_window: string | null;
  } | null;
  store: {
    id: string;
    name: string;
    address: string | null;
    access_conditions: string | null;
    delivery_window_start: string | null;
    delivery_window_end: string | null;
    latitude: number | null;
    longitude: number | null;
    is_van_only: boolean | null;
    manager: { name: string | null; phone: string | null } | null;
  } | null;
}

export interface TripRow {
  id: string;
  trip_number: string;
  trip_date: string;
  status: string;
  bay: string | null;
  departure_time: string | null;
  dispatched_at: string | null;
  vehicle: VehicleRow | null;
  stops: StopRow[] | null;
}

const STOP_STATUSES: StopStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'];

export function normalizeStopStatus(value: string | null | undefined): StopStatus {
  const upper = (value ?? '').toUpperCase() as StopStatus;
  return STOP_STATUSES.includes(upper) ? upper : 'PENDING';
}

function normalizeTemp(value: string | null | undefined): TempRequirement {
  return value === 'chilled' ? 'chilled' : 'ambient';
}

export function mapProfile(row: ProfileRow): DriverProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    employeeId: row.employee_id,
    station: row.station ?? null,
    shift: row.shift ?? null,
    avatarUrl: row.avatar_url,
  };
}

export function mapVehicle(row: VehicleRow | null): Vehicle | null {
  if (!row) return null;
  return {
    id: row.id,
    registrationNumber: row.registration_number,
    vehicleType: row.vehicle_type,
    isRefrigerated: Boolean(row.is_refrigerated),
    maxWeightKg: row.max_weight_kg,
  };
}

export function mapStop(row: StopRow): TripStop | null {
  const store = row.store;
  if (!store) return null; // a stop without a visible store cannot be delivered
  const order = row.order;
  return {
    id: row.id,
    sequence: row.stop_sequence,
    status: normalizeStopStatus(row.status),
    estimatedArrival: row.estimated_arrival,
    completedAt: row.completed_at,
    orderId: order?.id ?? null,
    orderNumber: order?.order_number ?? null,
    itemCount: order?.item_count ?? 0,
    weightKg: Number(order?.total_weight_kg ?? 0),
    volumeM3: Number(order?.total_volume_m3 ?? 0),
    temp: normalizeTemp(order?.temp_requirement),
    window: formatWindow(store.delivery_window_start, store.delivery_window_end, order?.delivery_window),
    storeId: store.id,
    storeName: store.name,
    address: store.address,
    accessConditions: store.access_conditions,
    isVanOnly: Boolean(store.is_van_only),
    latitude: store.latitude,
    longitude: store.longitude,
    managerName: store.manager?.name ?? null,
    managerPhone: store.manager?.phone ?? null,
  };
}

export function mapTrip(row: TripRow): Trip {
  const stops = (row.stops ?? [])
    .map(mapStop)
    .filter((s): s is TripStop => s !== null)
    .sort((a, b) => a.sequence - b.sequence);
  return {
    id: row.id,
    tripNumber: row.trip_number,
    tripDate: row.trip_date,
    status: row.status as Trip['status'],
    bay: row.bay,
    departureTime: row.departure_time,
    dispatchedAt: row.dispatched_at,
    vehicle: mapVehicle(row.vehicle),
    stops,
  };
}
