import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface AppError {
  message: string;
  code: number;
  field?: string;
}

function normalizeError(error: AxiosError): AppError {
  const data = error.response?.data as Record<string, unknown> | undefined;
  return {
    message: (data?.message as string) || 'Terjadi kesalahan, coba lagi.',
    code: error.response?.status ?? 500,
    field: data?.field as string | undefined,
  };
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Concurrent 401 handling — queue pending requests during token refresh ────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token as string);
  });
  failedQueue = [];
}

// ── Response interceptor: handle 401 / 402 ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until the active refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api.request(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshed = await useAuthStore.getState().refreshSession();
        if (refreshed) {
          const token = useAuthStore.getState().token as string;
          processQueue(null, token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api.request(originalRequest);
        }
        processQueue(error, null);
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') window.location.href = '/login';
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 402) {
      useAuthStore.getState().setSubscriptionExpired(true);
    }

    return Promise.reject(normalizeError(error));
  },
);

export default api;
