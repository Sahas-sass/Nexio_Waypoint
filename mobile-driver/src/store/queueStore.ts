import { create } from 'zustand';

export interface QueueState {
  /** Connectivity state of the device */
  isOnline: boolean;
  /** Number of pending mutations or sync operations in queue */
  pendingCount: number;
  /** Active vehicle designation */
  currentVehicle: string;
  /** Logged-in driver name */
  driverName: string;
  /** Monotonically increasing version — bumped each time Supabase data is downloaded */
  dataVersion: number;

  /** Update connectivity status */
  setIsOnline: (isOnline: boolean) => void;
  /** Update number of pending records directly or with an updater function */
  setPendingCount: (pendingCount: number | ((prev: number) => number)) => void;
  /** Update current vehicle designation */
  setCurrentVehicle: (currentVehicle: string) => void;
  /** Update current driver name */
  setDriverName: (driverName: string) => void;
  /** Bump dataVersion to trigger screen re-renders after Supabase sync */
  bumpDataVersion: () => void;

  /** Convenience action: Increment pending queue count */
  incrementPendingCount: (amount?: number) => void;
  /** Convenience action: Decrement pending queue count (clamped to 0) */
  decrementPendingCount: (amount?: number) => void;
  /** Convenience action: Reset pending queue count */
  resetQueue: () => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  // Initial state defaults
  isOnline: true,
  pendingCount: 0,
  currentVehicle: 'TRK-024',
  driverName: 'Kasun Perera',
  dataVersion: 0,

  // Actions
  setIsOnline: (isOnline: boolean) => set({ isOnline }),

  setPendingCount: (pendingCount: number | ((prev: number) => number)) =>
    set((state) => ({
      pendingCount:
        typeof pendingCount === 'function' ? pendingCount(state.pendingCount) : pendingCount,
    })),

  setCurrentVehicle: (currentVehicle: string) => set({ currentVehicle }),

  setDriverName: (driverName: string) => set({ driverName }),

  bumpDataVersion: () => set((state) => ({ dataVersion: state.dataVersion + 1 })),

  incrementPendingCount: (amount: number = 1) =>
    set((state) => ({ pendingCount: Math.max(0, state.pendingCount + amount) })),

  decrementPendingCount: (amount: number = 1) =>
    set((state) => ({ pendingCount: Math.max(0, state.pendingCount - amount) })),

  resetQueue: () => set({ pendingCount: 0 }),
}));

// Standalone action helpers for testing or non-React execution contexts
export const setIsOnline = (isOnline: boolean) =>
  useQueueStore.getState().setIsOnline(isOnline);

export const setPendingCount = (pendingCount: number | ((prev: number) => number)) =>
  useQueueStore.getState().setPendingCount(pendingCount);

export const setCurrentVehicle = (currentVehicle: string) =>
  useQueueStore.getState().setCurrentVehicle(currentVehicle);

export const setDriverName = (driverName: string) =>
  useQueueStore.getState().setDriverName(driverName);

export const incrementPendingCount = (amount?: number) =>
  useQueueStore.getState().incrementPendingCount(amount);

export const decrementPendingCount = (amount?: number) =>
  useQueueStore.getState().decrementPendingCount(amount);

export const resetQueue = () =>
  useQueueStore.getState().resetQueue();

export default useQueueStore;
