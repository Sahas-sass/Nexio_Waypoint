import * as Location from 'expo-location';
import { io, Socket } from 'socket.io-client';
import { enqueueSyncItem } from '@/database/syncManager';
import { useLocationStore } from '@/store/locationStore';

// Environment-driven WebSocket endpoint for production or local development
const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  'http://localhost:5000';

class LocationService {
  private socket: Socket | null = null;
  private locationSubscription: Location.LocationSubscription | null = null;
  private isTracking = false;
  private lastOfflineTelemetryTime = 0;

  public initialize() {
    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      transports: ['websocket'],   // Skip HTTP polling — go straight to WebSocket
    });

    this.socket.on('connect', () => {
      console.log('[LocationService] Connected to WebSocket backend:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('[LocationService] Disconnected from WebSocket backend.');
    });
  }

  public async startTracking(driverId: string = 'driver_123') {
    if (this.isTracking) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('[LocationService] Permission to access location was denied');
        return;
      }

      this.isTracking = true;
      console.log('[LocationService] Starting background tracking...');

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // 5 seconds
          distanceInterval: 10, // 10 meters
        },
        (location) => {
          this.handleLocationUpdate(driverId, location);
        }
      );
    } catch (error) {
      console.error('[LocationService] Error starting location tracking:', error);
      this.isTracking = false;
    }
  }

  public stopTracking() {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    this.isTracking = false;
    console.log('[LocationService] Stopped background tracking.');
  }

  private handleLocationUpdate(driverId: string, location: Location.LocationObject) {
    const payload = {
      driverId,
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      timestamp: location.timestamp,
      speed: location.coords.speed,
      heading: location.coords.heading,
    };

    // Update global store for UI (current-stop.tsx)
    useLocationStore.getState().setLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (this.socket && this.socket.connected) {
      // Online: Emit directly to WebSocket
      this.socket.emit('driver_location_update', payload);
    } else {
      // Offline: Throttle telemetry queueing to at most once per 30s to prevent DB queue explosion
      const now = Date.now();
      if (now - this.lastOfflineTelemetryTime >= 30000) {
        this.lastOfflineTelemetryTime = now;
        enqueueSyncItem('system_telemetry', 'LOCATION_UPDATE', payload);
      }
    }
  }
}

export const locationService = new LocationService();
