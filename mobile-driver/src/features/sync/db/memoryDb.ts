import type { LocalDb, OutboxRow } from '../types';

export interface KeyValueBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const CACHE_KEY = 'waypoint.cache';
const OUTBOX_KEY = 'waypoint.outbox';

/**
 * LocalDb kept in memory and mirrored to a key/value backend (browser
 * localStorage on web). Also used as the test double for services.
 */
export function createMemoryDb(backend?: KeyValueBackend): LocalDb {
  let cache: Record<string, unknown> = {};
  let outbox: OutboxRow[] = [];

  const read = <T>(key: string, fallback: T): T => {
    try {
      const raw = backend?.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  };
  const persist = () => {
    try {
      backend?.setItem(CACHE_KEY, JSON.stringify(cache));
      backend?.setItem(OUTBOX_KEY, JSON.stringify(outbox));
    } catch {
      // storage can be unavailable (private mode); memory copy still works
    }
  };
  const patch = (id: string, change: (row: OutboxRow) => OutboxRow) => {
    outbox = outbox.map((r) => (r.id === id ? change(r) : r));
    persist();
  };

  return {
    init() {
      cache = read(CACHE_KEY, {});
      outbox = read(OUTBOX_KEY, []);
    },
    getCache<T>(key: string) {
      return key in cache ? (cache[key] as T) : null;
    },
    setCache(key, value) {
      cache = { ...cache, [key]: JSON.parse(JSON.stringify(value)) };
      persist();
    },
    insertOutbox(row) {
      outbox = [...outbox, { ...row }];
      persist();
    },
    listOutbox() {
      return [...outbox].sort((a, b) => a.created_at.localeCompare(b.created_at));
    },
    markSynced(id, syncedAt) {
      patch(id, (r) => ({ ...r, status: 'SYNCED', last_error: null, synced_at: syncedAt }));
    },
    markFailed(id, error) {
      patch(id, (r) => ({ ...r, attempts: r.attempts + 1, last_error: error }));
    },
    updatePayload(id, payload) {
      patch(id, (r) => ({ ...r, payload }));
    },
    clearAll() {
      cache = {};
      outbox = [];
      try {
        backend?.removeItem(CACHE_KEY);
        backend?.removeItem(OUTBOX_KEY);
      } catch {
        // ignore
      }
    },
  };
}
