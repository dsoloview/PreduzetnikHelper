import { create } from 'zustand';

const STORAGE_KEY = 'preduzetnik_access_token';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem(STORAGE_KEY),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEY),

  setToken: (token: string) => {
    localStorage.setItem(STORAGE_KEY, token);
    set({ accessToken: token, isAuthenticated: true });
  },

  clearToken: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ accessToken: null, isAuthenticated: false });
  },
}));
