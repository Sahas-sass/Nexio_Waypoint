import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 5000;

/**
 * Resolves the api-backend base URL (also used for the Socket.io connection).
 *
 * 1. EXPO_PUBLIC_API_URL from .env, if set.
 * 2. Web: localhost only during development; a production web build without
 *    EXPO_PUBLIC_API_URL has no telemetry socket (positions still reach the
 *    database through the driver_update_location RPC).
 * 3. Native: the IP of the machine running Expo (taken from the Metro host),
 *    so a physical phone on the same Wi-Fi reaches the backend.
 * 4. Otherwise localhost.
 */
function resolveApiUrl(): string | null {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  if (Platform.OS === 'web') return __DEV__ ? `http://127.0.0.1:${API_PORT}` : null;

  // hostUri looks like "192.168.8.158:8081" when served by the dev server
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:${API_PORT}`;

  return `http://localhost:${API_PORT}`;
}

export const API_URL = resolveApiUrl();
