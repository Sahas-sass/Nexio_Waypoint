import { create } from 'zustand';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

export interface LocationState {
  /** Current driver coordinates (null until first fix) */
  coords: LocationCoords | null;
  /** Whether location tracking is actively running */
  isTracking: boolean;

  /** Update the current coordinates */
  setCoords: (coords: LocationCoords) => void;
  /** Update tracking status */
  setIsTracking: (isTracking: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  coords: null,
  isTracking: false,

  setCoords: (coords: LocationCoords) => set({ coords }),
  setIsTracking: (isTracking: boolean) => set({ isTracking }),
}));

export default useLocationStore;
