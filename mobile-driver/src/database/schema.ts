import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

/**
 * SQLite Database Connection
 * Initialized synchronously as the local offline-first persistent store.
 */
export const db: SQLiteDatabase = openDatabaseSync('waypoint.db');

export type StopStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface StopRecord {
  id: string;
  stop_number: number;
  store_name: string;
  address: string;
  window: string;
  is_chilled: number; // 1 for chilled, 0 for ambient
  items_count: number;
  weight_kg: number;
  volume_m3: number;
  
  // Structured Access Conditions
  access_type: string; // e.g., 'Rear Dock'
  access_instructions: string; // e.g., 'Enter from Chapel Lane'
  vehicle_restriction: string; // e.g., 'Van Access Only'
  vehicle_instructions: string; // e.g., 'Height restriction'
  loading_bay_window: string; // e.g., '7:45-8:30 AM'
  loading_bay_notes: string; // e.g., 'Bay 3 reserved'
  
  latitude?: number;
  longitude?: number;
  status: StopStatus;
  manager_id?: string;
}

export interface StoreManagerRecord {
  id: string;
  name: string;
  phone: string;
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
  payload: string; // JSON serialized string
  status: SyncStatus;
  created_at: string;
}

export const SEED_MANAGERS: readonly StoreManagerRecord[] = [
  { id: 'm1', name: 'Nimal Rathnayake', phone: '+94 77 123 4567' },
  { id: 'm2', name: 'Kamal Perera', phone: '+94 71 987 6543' },
];

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
    access_type: 'Front Access',
    access_instructions: 'Standard Entry',
    vehicle_restriction: 'None',
    vehicle_instructions: '',
    loading_bay_window: '7:00-8:00 AM',
    loading_bay_notes: 'Use visitor parking',
    latitude: 6.9061,
    longitude: 79.8710,
    status: 'PENDING',
    manager_id: 'm1',
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
    access_type: 'Rear Dock',
    access_instructions: 'Enter from Chapel Lane',
    vehicle_restriction: 'Van Access Only',
    vehicle_instructions: 'Height restriction 2.1m',
    loading_bay_window: '7:45-8:30 AM',
    loading_bay_notes: 'Bay 3 reserved for your vehicle',
    latitude: 6.8649,
    longitude: 79.8997,
    status: 'PENDING',
    manager_id: 'm2',
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
    access_type: 'Curbside',
    access_instructions: 'Main Road',
    vehicle_restriction: 'None',
    vehicle_instructions: '',
    loading_bay_window: '9:00-10:00 AM',
    loading_bay_notes: 'Hazard lights required',
    latitude: 6.9000,
    longitude: 79.8541,
    status: 'PENDING',
    manager_id: 'm1',
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
    access_type: 'Underground',
    access_instructions: 'Service Bay',
    vehicle_restriction: 'Clearance 2.5m',
    vehicle_instructions: 'Watch overhead pipes',
    loading_bay_window: '10:30-11:15 AM',
    loading_bay_notes: 'Use service elevator',
    latitude: 6.8406,
    longitude: 79.8732,
    status: 'PENDING',
    manager_id: 'm2',
  },
] as const;

/**
 * Initialize database tables (stops, sync_queue) and seed initial stops if empty.
 */
export function initDatabase(): void {
  // Enable Write-Ahead Logging for high-throughput mobile storage
  db.execSync('PRAGMA journal_mode = WAL;');

  // Table: store_managers
  db.execSync(`
    CREATE TABLE IF NOT EXISTS store_managers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL
    );
  `);

  // Table: stops
  db.execSync(`
    CREATE TABLE IF NOT EXISTS stops (
      id TEXT PRIMARY KEY,
      stop_number INTEGER NOT NULL,
      store_name TEXT NOT NULL,
      address TEXT NOT NULL,
      window TEXT NOT NULL,
      is_chilled INTEGER NOT NULL,
      items_count INTEGER NOT NULL,
      weight_kg REAL NOT NULL,
      volume_m3 REAL NOT NULL,
      access_type TEXT,
      access_instructions TEXT,
      vehicle_restriction TEXT,
      vehicle_instructions TEXT,
      loading_bay_window TEXT,
      loading_bay_notes TEXT,
      latitude REAL,
      longitude REAL,
      status TEXT DEFAULT 'PENDING',
      manager_id TEXT,
      FOREIGN KEY(manager_id) REFERENCES store_managers(id)
    );
  `);

  // Table: sync_queue
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      stop_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      created_at TEXT NOT NULL
    );
  `);

  // Seed store managers if table is empty
  const managerCountRow = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM store_managers;'
  );
  if (managerCountRow && managerCountRow.count === 0) {
    const insertManager = db.prepareSync(
      'INSERT INTO store_managers (id, name, phone) VALUES (?, ?, ?);'
    );
    try {
      for (const manager of SEED_MANAGERS) {
        insertManager.executeSync([manager.id, manager.name, manager.phone]);
      }
    } finally {
      insertManager.finalizeSync();
    }
  }

  // Seed stops if table is empty
  const countRow = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM stops;'
  );
  const rowCount = countRow ? countRow.count : 0;

  if (rowCount === 0) {
    const insertStatement = db.prepareSync(`
      INSERT INTO stops (
        id, stop_number, store_name, address, window,
        is_chilled, items_count, weight_kg, volume_m3,
        access_type, access_instructions, vehicle_restriction,
        vehicle_instructions, loading_bay_window, loading_bay_notes,
        latitude, longitude, status, manager_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    try {
      for (const stop of SEED_STOPS) {
        insertStatement.executeSync([
          stop.id,
          stop.stop_number,
          stop.store_name,
          stop.address,
          stop.window,
          stop.is_chilled,
          stop.items_count,
          stop.weight_kg,
          stop.volume_m3,
          stop.access_type,
          stop.access_instructions,
          stop.vehicle_restriction,
          stop.vehicle_instructions,
          stop.loading_bay_window,
          stop.loading_bay_notes,
          stop.latitude ?? null,
          stop.longitude ?? null,
          stop.status,
          stop.manager_id ?? null,
        ]);
      }
    } finally {
      insertStatement.finalizeSync();
    }
  }
}
