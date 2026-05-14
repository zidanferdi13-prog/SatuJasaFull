import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { useAuthStore } from '../store/authStore';
import { setLogoutCallback, setSubscriptionExpiredCallback } from '../shared/services/api-client';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const logout = useAuthStore((s) => s.logout);
  const setSubscriptionExpired = useAuthStore((s) => s.setSubscriptionExpired);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    // Wire up API client callbacks
    setLogoutCallback(() => logout());
    setSubscriptionExpiredCallback(() => setSubscriptionExpired(true));

    // Hydrate persisted auth state
    hydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
