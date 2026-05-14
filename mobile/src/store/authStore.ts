import { create } from 'zustand';
import { User, Branch } from '../shared/types';
import { storage } from '../shared/services/storage';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  selectedBranch: Branch | null;
  isSubscriptionExpired: boolean;
  isHydrated: boolean;

  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setSelectedBranch: (branch: Branch | null) => Promise<void>;
  setSubscriptionExpired: (expired: boolean) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  selectedBranch: null,
  isSubscriptionExpired: false,
  isHydrated: false,

  setUser: (user) => {
    set({ user });
    if (user) storage.setUser(user);
  },

  setTokens: async (accessToken, refreshToken) => {
    set({ accessToken, refreshToken });
    await storage.setTokens(accessToken, refreshToken);
  },

  setSelectedBranch: async (branch) => {
    set({ selectedBranch: branch });
    await storage.setSelectedBranch(branch);
  },

  setSubscriptionExpired: (expired) => set({ isSubscriptionExpired: expired }),

  logout: async () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      selectedBranch: null,
      isSubscriptionExpired: false,
    });
    await storage.clearAll();
  },

  hydrate: async () => {
    const [user, accessToken, refreshToken, selectedBranch] = await Promise.all([
      storage.getUser<User>(),
      storage.getAccessToken(),
      storage.getRefreshToken(),
      storage.getSelectedBranch<Branch>(),
    ]);
    set({
      user: user || null,
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
      selectedBranch: selectedBranch || null,
      isHydrated: true,
    });
  },
}));

