import axios from 'axios';
import { useAuthStore } from '@/entities/user/model/auth.store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
/** Requests that got a 401 while a refresh was in flight; each is retried or rejected once the refresh settles */
let refreshQueue: Array<{ retry: (token: string) => void; fail: (error: unknown) => void }> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // A 401 from the auth endpoints themselves means bad credentials, not an expired access token
    const isAuthEndpoint = ['/auth/refresh', '/auth/login', '/auth/register']
      .some((path) => originalRequest.url?.includes(path));

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            retry: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            fail: reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await apiClient.post<{ accessToken: string }>('/auth/refresh');
        const newToken = response.data.accessToken;
        useAuthStore.getState().setToken(newToken);
        refreshQueue.forEach(({ retry }) => retry(newToken));
        refreshQueue = [];
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        // Without this the queued requests would never settle and their queries would show a spinner forever
        refreshQueue.forEach(({ fail }) => fail(error));
        refreshQueue = [];
        useAuthStore.getState().clearToken();
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
