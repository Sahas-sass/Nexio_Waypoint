import type { TripSnapshot } from '../types';
import { mapProfile, mapTrip, type ProfileRow, type TripRow } from '../utils/mapTrip';

export const ACTIVE_TRIP_STATUSES = ['loading', 'en_route'] as const;

const PROFILE_COLUMNS = 'id, role, full_name, phone, employee_id, station, shift, avatar_url';

export const TRIP_SELECT = `
  id, trip_number, trip_date, status, bay, departure_time, dispatched_at,
  vehicle:vehicles(id, registration_number, vehicle_type, is_refrigerated, max_weight_kg),
  stops:trip_stops(
    id, stop_sequence, status, estimated_arrival, completed_at,
    order:orders(id, order_number, item_count, total_weight_kg, total_volume_m3, temp_requirement, delivery_window),
    store:stores(
      id, name, address, access_conditions, delivery_window_start, delivery_window_end,
      latitude, longitude, is_van_only,
      manager:store_managers(name, phone)
    )
  )`;

type QueryResult<T> = PromiseLike<{ data: T | null; error: { message: string } | null }>;

/** Chainable slice of the PostgREST builder used here (mockable in tests). */
export interface TripQueryClient {
  from(table: string): any;
}

export interface ProfileWithRole extends ProfileRow {
  role: string;
}

export async function fetchProfile(client: TripQueryClient, userId: string): Promise<ProfileWithRole> {
  const { data, error } = await (client
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .single() as QueryResult<ProfileWithRole>);
  if (error || !data) throw new Error(error?.message ?? 'Profile not found.');
  return data;
}

/** The signed-in driver's current trip (loading / en route, most recent date) or null. */
export async function fetchCurrentTrip(client: TripQueryClient, driverId: string) {
  const { data, error } = await (client
    .from('trips')
    .select(TRIP_SELECT)
    .eq('driver_id', driverId)
    .in('status', ACTIVE_TRIP_STATUSES)
    .order('trip_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1) as QueryResult<TripRow[]>);
  if (error) throw new Error(error.message);
  const row = data?.[0];
  return row ? mapTrip(row) : null;
}

export async function downloadSnapshot(client: TripQueryClient, driverId: string, now = new Date()): Promise<TripSnapshot> {
  const [profile, trip] = await Promise.all([fetchProfile(client, driverId), fetchCurrentTrip(client, driverId)]);
  return { driver: mapProfile(profile), trip, downloadedAt: now.toISOString() };
}
