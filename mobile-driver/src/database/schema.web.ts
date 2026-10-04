/**
 * Web-specific database fallback.
 *
 * expo-sqlite's web implementation relies on WASM + Web Workers that
 * Metro's dev server cannot bundle correctly. This file provides the
 * same exports using a simple in-memory store so the app can at least
 * render on the web during development. On native (iOS / Android) Metro
 * ignores this file and loads the real schema.ts with full SQLite.
 */

export type StopStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface StopRecord {
  id: string;
  stop_number: number;
  store_name: string;
  address: string;
  window: string;
  is_chilled: number;
  items_count: number;
  weight_kg: number;
  volume_m3: number;
  access_notes: string;
  latitude?: number;
  longitude?: number;
  status: StopStatus;
}

export type SyncActionType = 'POD_COMPLETE' | 'STATUS_UPDATE';
export type SyncStatus = 'PENDING' | 'SYNCED';

export interface SyncPayload {
  signatureData?: string | null;
  photoUris?: string[];
  notes?: string;
  timestamp?: string | number;
  [key: string]: unknown;
}

export interface SyncQueueRecord {
  id: string;
  stop_id: string;
  action_type: SyncActionType;
  payload: string;
  status: SyncStatus;
  created_at: string;
}

export const SEED_STOPS: readonly StopRecord[] = [
  {
    id: '01',
    stop_number: 1,
    store_name: 'Fresh Store #18',
    address: 'Colombo 07',
    window: 'Before 8:00 AM',
    is_chilled: 1,
    items_count: 16,
    weight_kg: 240,
    volume_m3: 1.6,
    access_notes: 'Standard Front Access',
    latitude: 6.9061,
    longitude: 79.871,
    status: 'PENDING',
  },
  {
    id: '02',
    stop_number: 2,
    store_name: 'Fresh Store #22',
    address: 'Nugegoda',
    window: '8:00 - 8:30 AM',
    is_chilled: 1,
    items_count: 28,
    weight_kg: 420,
    volume_m3: 2.4,
    access_notes:
      'Rear Dock, Enter from Chapel Lane, Van Access Only, Bay 3 reserved',
    latitude: 6.8649,
    longitude: 79.8997,
    status: 'PENDING',
  },
  {
    id: '03',
    stop_number: 3,
    store_name: 'Style Store #08',
    address: 'Colombo 03',
    window: '9:00 - 10:00 AM',
    is_chilled: 0,
    items_count: 12,
    weight_kg: 180,
    volume_m3: 1.8,
    access_notes: 'Curbside Unloading',
    latitude: 6.9,
    longitude: 79.8541,
    status: 'PENDING',
  },
  {
    id: '04',
    stop_number: 4,
    store_name: 'Daily Market #11',
    address: 'Dehiwala',
    window: '10:30 - 11:15 AM',
    is_chilled: 0,
    items_count: 20,
    weight_kg: 310,
    volume_m3: 2.1,
    access_notes: 'Underground Service Bay',
    latitude: 6.8406,
    longitude: 79.8732,
    status: 'PENDING',
  },
] as const;

// ---------------------------------------------------------------------------
// Lightweight in-memory "database" that mirrors the SQLite API surface
// used by the rest of the app. Data resets on every page reload.
// ---------------------------------------------------------------------------

const _stops = new Map<string, StopRecord>(
  SEED_STOPS.map((s) => [s.id, { ...s }])
);

const _syncQueue = new Map<string, SyncQueueRecord>();

/**
 * Minimal db proxy so callers like `db.getFirstSync(...)` keep working.
 */
export const db = {
  execSync(_sql: string): void {
    /* no-op on web */
  },

  getFirstSync<T = unknown>(
    sql: string,
    params?: unknown[]
  ): T | null {
    // Handle common queries used in the app
    if (sql.includes('COUNT(*)')) {
      return { count: _stops.size } as unknown as T;
    }
    if (sql.includes('FROM stops')) {
      const id = params?.[0] as string | undefined;
      if (id) {
        return (_stops.get(id) as unknown as T) ?? null;
      }
      // Return first stop
      const first = _stops.values().next().value;
      return (first as unknown as T) ?? null;
    }
    if (sql.includes('FROM sync_queue')) {
      const id = params?.[0] as string | undefined;
      if (id) {
        return (_syncQueue.get(id) as unknown as T) ?? null;
      }
      return null;
    }
    return null;
  },

  getAllSync<T = unknown>(
    sql: string,
    _params?: unknown[]
  ): T[] {
    if (sql.includes('FROM stops')) {
      return Array.from(_stops.values()) as unknown as T[];
    }
    if (sql.includes('FROM sync_queue')) {
      return Array.from(_syncQueue.values()) as unknown as T[];
    }
    return [];
  },

  runSync(
    sql: string,
    params?: unknown[]
  ): { changes: number; lastInsertRowId: number } {
    // Handle UPDATE stops SET status
    if (sql.includes('UPDATE stops') && sql.includes('status')) {
      const status = params?.[0] as StopStatus;
      const id = params?.[1] as string;
      const stop = _stops.get(id);
      if (stop) {
        stop.status = status;
      }
    }
    return { changes: 1, lastInsertRowId: 0 };
  },

  prepareSync(_sql: string) {
    return {
      executeSync(_params: unknown[]) {
        return { changes: 1, lastInsertRowId: 0 };
      },
      finalizeSync() {
        /* no-op */
      },
    };
  },
};

/** No-op on web — tables are seeded from SEED_STOPS above. */
export function initDatabase(): void {
  console.log('[schema.web] Using in-memory web fallback database');
}
