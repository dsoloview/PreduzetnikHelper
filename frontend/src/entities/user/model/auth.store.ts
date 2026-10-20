import { create } from 'zustand';

export type SessionStatus = 'unknown' | 'authenticated' | 'anonymous';

interface AuthState {
  accessToken: string | null;
  status: SessionStatus;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  status: 'unknown',
  isAuthenticated: false,

  setToken: (token: string) => {
    set({ accessToken: token, status: 'authenticated', isAuthenticated: true });
  },

  clearToken: () => {
    set({ accessToken: null, status: 'anonymous', isAuthenticated: false });
  },
}));
