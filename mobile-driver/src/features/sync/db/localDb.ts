import { openDatabaseSync } from 'expo-sqlite';

import type { LocalDb, OutboxRow } from '../types';

const db = openDatabaseSync('waypoint.db');

export const localDb: LocalDb = {
  init() {
    db.execSync(`
      PRAGMA journal_mode = WAL;
      DROP TABLE IF EXISTS stops;
      DROP TABLE IF EXISTS store_managers;
      DROP TABLE IF EXISTS sync_queue;
      CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS outbox (
        id TEXT PRIMARY KEY NOT NULL,
        stop_id TEXT,
        action_type TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL,
        synced_at TEXT
      );
    `);
  },
  getCache<T>(key: string) {
    const row = db.getFirstSync<{ value: string }>('SELECT value FROM cache WHERE key = ?;', [key]);
    return row ? (JSON.parse(row.value) as T) : null;
  },
  setCache(key, value) {
    db.runSync('INSERT OR REPLACE INTO cache (key, value) VALUES (?, ?);', [key, JSON.stringify(value)]);
  },
  insertOutbox(row: OutboxRow) {
    db.runSync(
      `INSERT INTO outbox (id, stop_id, action_type, payload, status, attempts, last_error, created_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [row.id, row.stop_id, row.action_type, row.payload, row.status, row.attempts, row.last_error, row.created_at, row.synced_at]
    );
  },
  listOutbox() {
    return db.getAllSync<OutboxRow>('SELECT * FROM outbox ORDER BY created_at ASC;');
  },
  markSynced(id, syncedAt) {
    db.runSync("UPDATE outbox SET status = 'SYNCED', last_error = NULL, synced_at = ? WHERE id = ?;", [syncedAt, id]);
  },
  markFailed(id, error) {
    db.runSync('UPDATE outbox SET attempts = attempts + 1, last_error = ? WHERE id = ?;', [error, id]);
  },
  updatePayload(id, payload) {
    db.runSync('UPDATE outbox SET payload = ? WHERE id = ?;', [payload, id]);
  },
  clearAll() {
    db.execSync('DELETE FROM cache; DELETE FROM outbox;');
  },
};
