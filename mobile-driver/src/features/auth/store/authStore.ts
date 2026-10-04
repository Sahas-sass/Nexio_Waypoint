import { create } from 'zustand';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  userId: string | null;
  /** Message shown on the login screen (e.g. "not a driver account"). */
  notice: string | null;
  setSignedIn: (userId: string) => void;
  setSignedOut: (notice?: string | null) => void;
  clearNotice: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  userId: null,
  notice: null,
  setSignedIn: (userId) => set({ status: 'signedIn', userId, notice: null }),
  setSignedOut: (notice = null) => set({ status: 'signedOut', userId: null, notice }),
  clearNotice: () => set({ notice: null }),
}));
