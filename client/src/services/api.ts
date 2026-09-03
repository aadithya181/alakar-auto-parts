import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { handleFallbackApi } from './fallbackData';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('torq_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor with graceful fallback
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string }>) => {
    // If backend is unavailable or endpoint returned error, attempt fallback
    const config = error.config;
    if (config && config.url) {
      const fallbackResult = handleFallbackApi(
        config.method || 'GET',
        config.url,
        config.params,
        config.data ? JSON.parse(config.data || '{}') : {}
      );
      if (fallbackResult && fallbackResult.success) {
        return fallbackResult;
      }
    }

    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
