import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

const STORAGE_KEY = 'preduzetnik_access_token';

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem(STORAGE_KEY),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEY),

  setToken: (token: string) => {
    localStorage.setItem(STORAGE_KEY, token);
    set({ accessToken: token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ accessToken: null, isAuthenticated: false });
  },
}));

// Listen to the custom event emitted by our Axios interceptor on 401
window.addEventListener('auth:unauthorized', () => {
  useAuthStore.getState().logout();
});
