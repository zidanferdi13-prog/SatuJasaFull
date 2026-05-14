import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../constants';
import { storage } from './storage';
import { ApiError } from './api-error';

let _logoutCallback: (() => void) | null = null;
let _subscriptionExpiredCallback: (() => void) | null = null;

export function setLogoutCallback(fn: () => void) {
  _logoutCallback = fn;
}

export function setSubscriptionExpiredCallback(fn: () => void) {
  _subscriptionExpiredCallback = fn;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject access token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  });
  pendingQueue = [];
}

// Response interceptor — handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const status: number = error.response?.status;
    const responseData = error.response?.data;

    // Handle subscription expired
    if (status === 402 || responseData?.code === 'SUBSCRIPTION_EXPIRED') {
      _subscriptionExpiredCallback?.();
      return Promise.reject(
        new ApiError(402, 'Langganan kadaluarsa', [], 'SUBSCRIPTION_EXPIRED')
      );
    }

    // Handle 401 — try refresh token
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const newAccessToken: string = data.data?.accessToken || data.accessToken;
        const newRefreshToken: string = data.data?.refreshToken || data.refreshToken;

        await storage.setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await storage.clearAll();
        _logoutCallback?.();
        return Promise.reject(
          new ApiError(401, 'Sesi berakhir. Silakan login kembali.')
        );
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error
    const message: string = responseData?.message || error.message || 'Terjadi kesalahan';
    const errors: string[] = responseData?.errors || [];
    const code: string | undefined = responseData?.code;

    return Promise.reject(new ApiError(status || 0, message, errors, code));
  }
);

export default apiClient;
