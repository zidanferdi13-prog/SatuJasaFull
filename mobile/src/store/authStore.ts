import { create } from 'zustand';
import { User } from '../shared/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setTokens: (token, refreshToken) => {
    set({ token, refreshToken });
  },
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  logout: () => set({ user: null, token: null, refreshToken: null }),
}));
