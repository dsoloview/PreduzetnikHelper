import { apiClient } from '@/shared/api/api.client';
import { useAuthStore } from './auth.store';

let restoring: Promise<void> | null = null;

export const restoreSession = (): Promise<void> => {
  restoring ??= apiClient
    .post<{ accessToken: string }>('/auth/refresh')
    .then((response) => useAuthStore.getState().setToken(response.data.accessToken))
    .catch(() => useAuthStore.getState().clearToken())
    .finally(() => {
      restoring = null;
    });
  return restoring;
};
