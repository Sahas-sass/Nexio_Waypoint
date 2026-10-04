import { tripRow } from '../fixtures';
import { mockQueryClient } from './mockQuery';
import { downloadSnapshot, fetchCurrentTrip, fetchProfile } from './tripService';

const profile = { id: 'uid', role: 'driver', full_name: 'Driver', phone: null, employee_id: 'D-1', avatar_url: null };

describe('tripService', () => {
  it('queries only the signed-in driver\'s active trips, newest first', async () => {
    const { client, calls } = mockQueryClient({ trips: { data: [tripRow()], error: null } });
    const trip = await fetchCurrentTrip(client, 'uid');
    expect(trip?.tripNumber).toBe('TRIP 1');
    expect(calls).toEqual(expect.arrayContaining([
      { table: 'trips', method: 'eq', args: ['driver_id', 'uid'] },
      { table: 'trips', method: 'in', args: ['status', ['loading', 'en_route']] },
      { table: 'trips', method: 'order', args: ['trip_date', { ascending: false }] },
      { table: 'trips', method: 'limit', args: [1] },
    ]));
    const select = calls.find((c) => c.method === 'select')!.args[0] as string;
    expect(select).toContain('stops:trip_stops(');
    expect(select).toContain('manager:store_managers(name, phone)');
  });

  it('returns null when there is no active trip and throws on errors', async () => {
    expect(await fetchCurrentTrip(mockQueryClient({ trips: { data: [], error: null } }).client, 'uid')).toBeNull();
    await expect(fetchCurrentTrip(mockQueryClient({ trips: { data: null, error: { message: 'denied' } } }).client, 'uid')).rejects.toThrow('denied');
  });

  it('fetches the profile by id', async () => {
    const { client, calls } = mockQueryClient({ profiles: { data: profile, error: null } });
    expect(await fetchProfile(client, 'uid')).toEqual(profile);
    expect(calls).toContainEqual({ table: 'profiles', method: 'eq', args: ['id', 'uid'] });
    await expect(fetchProfile(mockQueryClient({ profiles: { data: null, error: null } }).client, 'uid')).rejects.toThrow('Profile not found');
  });

  it('downloads a full snapshot', async () => {
    const { client } = mockQueryClient({ profiles: { data: profile, error: null }, trips: { data: [tripRow()], error: null } });
    const snapshot = await downloadSnapshot(client, 'uid', new Date('2026-10-04T00:00:00Z'));
    expect(snapshot.driver.fullName).toBe('Driver');
    expect(snapshot.trip?.stops).toHaveLength(2);
    expect(snapshot.downloadedAt).toBe('2026-10-04T00:00:00.000Z');
  });
});
