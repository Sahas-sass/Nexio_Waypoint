import { create } from 'zustand';

import type { StopStatus, TripSnapshot } from '../types';
import { withStopStatus } from '../utils/stopProgress';

export type TripLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface TripState {
  snapshot: TripSnapshot | null;
  status: TripLoadStatus;
  error: string | null;
  setLoading: () => void;
  setSnapshot: (snapshot: TripSnapshot | null) => void;
  setError: (error: string) => void;
  setStopStatus: (stopId: string, status: StopStatus, completedAt?: string | null) => void;
  reset: () => void;
}

export const useTripStore = create<TripState>((set) => ({
  snapshot: null,
  status: 'idle',
  error: null,
  setLoading: () => set({ status: 'loading', error: null }),
  setSnapshot: (snapshot) => set({ snapshot, status: 'ready', error: null }),
  setError: (error) => set({ status: 'error', error }),
  setStopStatus: (stopId, status, completedAt = null) =>
    set((state) => {
      const trip = state.snapshot?.trip;
      if (!state.snapshot || !trip) return state;
      return {
        snapshot: { ...state.snapshot, trip: { ...trip, stops: withStopStatus(trip.stops, stopId, status, completedAt) } },
      };
    }),
  reset: () => set({ snapshot: null, status: 'idle', error: null }),
}));
