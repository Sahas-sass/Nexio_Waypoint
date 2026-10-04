import type { Trip, TripStop } from './types';
import type { StopRow, TripRow } from './utils/mapTrip';

/** Test fixtures shaped like the Supabase rows / mapped trip. */
export function stopRow(over: Partial<StopRow> = {}): StopRow {
  return {
    id: 'stop-1',
    stop_sequence: 1,
    status: 'PENDING',
    estimated_arrival: null,
    completed_at: null,
    order: {
      id: 'order-1',
      order_number: 'ORD-1',
      item_count: 28,
      total_weight_kg: 420,
      total_volume_m3: 3.1,
      temp_requirement: 'chilled',
      delivery_window: '08:00 - 08:30 AM',
    },
    store: {
      id: 'store-1',
      name: 'Store One',
      address: '1 Main St',
      access_conditions: 'Rear dock',
      delivery_window_start: '08:00:00',
      delivery_window_end: '08:30:00',
      latitude: 6.87,
      longitude: 79.88,
      is_van_only: true,
      manager: { name: 'Manager', phone: '+94 1' },
    },
    ...over,
  };
}

export function tripRow(over: Partial<TripRow> = {}): TripRow {
  return {
    id: 'trip-1',
    trip_number: 'TRIP 1',
    trip_date: '2026-10-04',
    status: 'en_route',
    bay: 'Bay 04',
    departure_time: '06:30 AM',
    dispatched_at: null,
    vehicle: { id: 'veh-1', registration_number: 'TRK-1', vehicle_type: 'Truck', is_refrigerated: true, max_weight_kg: 5000 },
    stops: [stopRow({ id: 'stop-2', stop_sequence: 2 }), stopRow()],
    ...over,
  };
}

export function tripStop(over: Partial<TripStop> = {}): TripStop {
  return {
    id: 'stop-1',
    sequence: 1,
    status: 'PENDING',
    estimatedArrival: null,
    completedAt: null,
    orderId: 'order-1',
    orderNumber: 'ORD-1',
    itemCount: 10,
    weightKg: 100,
    volumeM3: 1,
    temp: 'ambient',
    window: null,
    storeId: 'store-1',
    storeName: 'Store One',
    address: null,
    accessConditions: null,
    isVanOnly: false,
    latitude: null,
    longitude: null,
    managerName: null,
    managerPhone: null,
    ...over,
  };
}

export function trip(stops: TripStop[]): Trip {
  return {
    id: 'trip-1',
    tripNumber: 'TRIP 1',
    tripDate: '2026-10-04',
    status: 'en_route',
    bay: null,
    departureTime: null,
    dispatchedAt: null,
    vehicle: null,
    stops,
  };
}
