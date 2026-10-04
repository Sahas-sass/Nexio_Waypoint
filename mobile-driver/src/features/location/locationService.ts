import * as Location from 'expo-location';
import { io, type Socket } from 'socket.io-client';

import { queueAndSync } from '@/features/sync/services/syncService';
import { useSyncStore } from '@/features/sync/store/syncStore';
import type { LocationPayload } from '@/features/sync/utils/payloads';
import { locationRpcArgs } from '@/features/sync/utils/payloads';
import { API_URL } from '@/lib/apiConfig';
import { supabase } from '@/lib/supabaseClient';

import { useLocationStore } from './locationStore';
import { isDue, nonNegativeOrUndefined } from './throttle';

const ONLINE_INTERVAL_MS = 30_000;
const OFFLINE_INTERVAL_MS = 120_000;

/**
 * GPS tracking for the active trip: updates the on-screen position, writes
 * trips.current_lat/lng via driver_update_location (queued while offline) and
 * relays live positions to the dispatcher map over the api-backend socket.
 */
class LocationService {
  private socket: Socket | null = null;
  private subscription: Location.LocationSubscription | null = null;
  private tripId: string | null = null;
  private lastSentAt: number | null = null;

  async start(tripId: string) {
    if (this.subscription && this.tripId === tripId) return;
    this.stop();
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    this.tripId = tripId;
    // api-backend authenticates the socket with the driver's Supabase access token
    this.socket = io(API_URL, {
      reconnection: true,
      transports: ['websocket'],
      auth: (cb) => {
        supabase.auth.getSession().then(({ data }) => cb({ token: data.session?.access_token ?? '' }));
      },
    });
    this.subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      (location) => this.handle(location)
    );
  }

  stop() {
    this.subscription?.remove();
    this.subscription = null;
    this.socket?.disconnect();
    this.socket = null;
    this.tripId = null;
    this.lastSentAt = null;
  }

  private handle(location: Location.LocationObject) {
    const { latitude, longitude } = location.coords;
    useLocationStore.getState().setLocation({ latitude, longitude });
    if (!this.tripId) return;

    if (this.socket?.connected) {
      this.socket.emit('driver_location_update', {
        tripId: this.tripId,
        lat: latitude,
        lng: longitude,
        timestamp: location.timestamp,
        // Devices report -1 / null when speed or heading is unknown
        speed: nonNegativeOrUndefined(location.coords.speed),
        heading: nonNegativeOrUndefined(location.coords.heading),
      });
    }

    const online = useSyncStore.getState().isOnline;
    const now = Date.now();
    if (!isDue(this.lastSentAt, now, online ? ONLINE_INTERVAL_MS : OFFLINE_INTERVAL_MS)) return;
    this.lastSentAt = now;

    const payload: LocationPayload = { tripId: this.tripId, lat: latitude, lng: longitude, recordedAt: new Date(now).toISOString() };
    if (online) {
      supabase.rpc('driver_update_location', locationRpcArgs(payload)).then(({ error }) => {
        if (error) queueAndSync('LOCATION_UPDATE', null, payload);
      });
    } else {
      queueAndSync('LOCATION_UPDATE', null, payload);
    }
  }
}

export const locationService = new LocationService();
