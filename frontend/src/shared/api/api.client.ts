import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Read directly from localStorage to avoid circular dependency with auth store
    const token = localStorage.getItem('preduzetnik_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, we might want to trigger a logout
    if (error.response?.status === 401) {
      localStorage.removeItem('preduzetnik_access_token');
      // Redirect to login (handled smoothly by routing or auth store listeners)
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);
