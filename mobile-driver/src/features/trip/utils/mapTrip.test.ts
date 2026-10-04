import { stopRow, tripRow } from '../fixtures';
import { mapProfile, mapStop, mapTrip, mapVehicle, normalizeStopStatus } from './mapTrip';

describe('mapTrip', () => {
  it('maps the trip, vehicle and stops ordered by sequence', () => {
    const trip = mapTrip(tripRow());
    expect(trip).toMatchObject({ id: 'trip-1', tripNumber: 'TRIP 1', status: 'en_route', bay: 'Bay 04' });
    expect(trip.vehicle).toEqual({ id: 'veh-1', registrationNumber: 'TRK-1', vehicleType: 'Truck', isRefrigerated: true, maxWeightKg: 5000 });
    expect(trip.stops.map((s) => s.sequence)).toEqual([1, 2]);
  });

  it('maps a stop with its order, store and manager', () => {
    expect(mapStop(stopRow())).toEqual({
      id: 'stop-1',
      sequence: 1,
      status: 'PENDING',
      estimatedArrival: null,
      completedAt: null,
      orderId: 'order-1',
      orderNumber: 'ORD-1',
      itemCount: 28,
      weightKg: 420,
      volumeM3: 3.1,
      temp: 'chilled',
      window: '8:00 AM – 8:30 AM',
      storeId: 'store-1',
      storeName: 'Store One',
      address: '1 Main St',
      accessConditions: 'Rear dock',
      isVanOnly: true,
      latitude: 6.87,
      longitude: 79.88,
      managerName: 'Manager',
      managerPhone: '+94 1',
    });
  });

  it('handles missing order / manager and drops stops without a store', () => {
    const row = stopRow({ order: null });
    row.store!.manager = null;
    row.store!.delivery_window_start = null;
    row.store!.delivery_window_end = null;
    const stop = mapStop(row)!;
    expect(stop).toMatchObject({ itemCount: 0, weightKg: 0, temp: 'ambient', window: null, managerPhone: null, orderId: null });
    expect(mapStop(stopRow({ store: null }))).toBeNull();
    expect(mapTrip(tripRow({ stops: [stopRow({ store: null })], vehicle: null }))).toMatchObject({ stops: [], vehicle: null });
    expect(mapTrip(tripRow({ stops: null })).stops).toEqual([]);
  });

  it('uses the order delivery window when the store has none', () => {
    const row = stopRow();
    row.store!.delivery_window_start = null;
    row.store!.delivery_window_end = null;
    expect(mapStop(row)!.window).toBe('08:00 - 08:30 AM');
  });

  it('normalises stop statuses', () => {
    expect(normalizeStopStatus('completed')).toBe('COMPLETED');
    expect(normalizeStopStatus('weird')).toBe('PENDING');
    expect(normalizeStopStatus(null)).toBe('PENDING');
  });

  it('maps profiles and vehicles', () => {
    expect(mapProfile({ id: 'u', full_name: 'A B', phone: null, employee_id: 'D-1', avatar_url: null })).toEqual({
      id: 'u', fullName: 'A B', phone: null, employeeId: 'D-1', station: null, shift: null, avatarUrl: null,
    });
    expect(mapVehicle(null)).toBeNull();
  });
});
