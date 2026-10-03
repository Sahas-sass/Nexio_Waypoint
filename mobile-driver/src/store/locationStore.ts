import { create } from 'zustand';

interface LocationState {
  coords: { latitude: number; longitude: number } | null;
  setLocation: (coords: { latitude: number; longitude: number }) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  coords: null,
  setLocation: (coords) => set({ coords }),
}));
