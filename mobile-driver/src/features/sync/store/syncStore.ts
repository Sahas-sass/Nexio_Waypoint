import { create } from 'zustand';

import { visiblePendingCount } from '../services/outbox';
import type { OutboxRow } from '../types';

interface SyncState {
  isOnline: boolean;
  outbox: OutboxRow[];
  /** Pending deliveries / status changes (GPS pings excluded). */
  pendingCount: number;
  syncing: boolean;
  lastSyncedAt: string | null;
  setIsOnline: (isOnline: boolean) => void;
  setOutbox: (outbox: OutboxRow[]) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncedAt: (iso: string) => void;
  reset: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true,
  outbox: [],
  pendingCount: 0,
  syncing: false,
  lastSyncedAt: null,
  setIsOnline: (isOnline) => set({ isOnline }),
  setOutbox: (outbox) => set({ outbox, pendingCount: visiblePendingCount(outbox) }),
  setSyncing: (syncing) => set({ syncing }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  reset: () => set({ outbox: [], pendingCount: 0, syncing: false, lastSyncedAt: null }),
}));
