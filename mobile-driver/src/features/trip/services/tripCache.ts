import type { LocalDb } from '@/features/sync/types';

import type { TripSnapshot } from '../types';

const SNAPSHOT_KEY = 'trip_snapshot';

export const loadSnapshot = (db: LocalDb) => db.getCache<TripSnapshot>(SNAPSHOT_KEY);

export const saveSnapshot = (db: LocalDb, snapshot: TripSnapshot) => db.setCache(SNAPSHOT_KEY, snapshot);
