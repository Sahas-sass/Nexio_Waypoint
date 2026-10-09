import { create } from 'zustand';

import type { LatLng } from '@/utils/haversine';

interface LocationState {
  coords: LatLng | null;
  setLocation: (coords: LatLng | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  coords: null,
  setLocation: (coords) => set({ coords }),
}));
