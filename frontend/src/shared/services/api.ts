import axios, { AxiosError } from 'axios';
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

// ── Response interceptor: handle 401 / 402 ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const refreshed = await useAuthStore.getState().refreshSession();
      if (refreshed && error.config) {
        // Retry original request with new token
        const token = useAuthStore.getState().token;
        if (token && error.config.headers) {
          error.config.headers.Authorization = `Bearer ${token}`;
        }
        return api.request(error.config);
      }
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 402) {
      useAuthStore.getState().setSubscriptionExpired(true);
    }

    return Promise.reject(normalizeError(error));
  },
);

export default api;
