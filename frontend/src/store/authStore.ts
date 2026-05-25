import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'ADMIN';
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  branchId?: string | null;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  subscriptionExpired: boolean;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSubscriptionExpired: (expired: boolean) => void;
  logout: () => void;
  initFromStorage: () => void;
  refreshSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoading: false,
  error: null,
  subscriptionExpired: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (!token) {
        localStorage.removeItem('user');
      }
    }
    set({ token, isAuthenticated: !!token });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSubscriptionExpired: (subscriptionExpired) => set({ subscriptionExpired }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      subscriptionExpired: false,
    });
  },

  initFromStorage: () => {
    if (typeof window === 'undefined') return;
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        set({ user: JSON.parse(rawUser) });
      } catch {
        localStorage.removeItem('user');
      }
    }
    set({ isHydrated: true });
  },

  refreshSession: async (): Promise<boolean> => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const newToken: string = data.data?.accessToken ?? data.data?.token ?? '';
      const newRefreshToken: string | null = data.data?.refreshToken ?? null;
      set({ token: newToken, refreshToken: newRefreshToken, isAuthenticated: true });
      return true;
    } catch {
      return false;
    }
  },
}));
