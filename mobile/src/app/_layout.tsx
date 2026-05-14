import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AppProvider } from './AppProvider';
import { useAuthStore } from '../store/authStore';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isSubscriptionExpired = useAuthStore((s) => s.isSubscriptionExpired);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSubscriptionExpired) {
      router.replace('/subscription-expired');
      return;
    }

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/dashboard');
    }
  }, [user, isHydrated, isSubscriptionExpired, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="subscription-expired" options={{ headerShown: false }} />
          <Stack.Screen name="customers/index" options={{ headerShown: true, title: 'Pelanggan' }} />
          <Stack.Screen name="customers/[id]" options={{ headerShown: true, title: 'Detail Pelanggan' }} />
          <Stack.Screen name="customers/create" options={{ headerShown: true, title: 'Tambah Pelanggan' }} />
          <Stack.Screen name="customers/[id]/edit" options={{ headerShown: true, title: 'Edit Pelanggan' }} />
          <Stack.Screen name="vehicles/index" options={{ headerShown: true, title: 'Kendaraan' }} />
          <Stack.Screen name="vehicles/[id]" options={{ headerShown: true, title: 'Detail Kendaraan' }} />
          <Stack.Screen name="vehicles/create" options={{ headerShown: true, title: 'Tambah Kendaraan' }} />
          <Stack.Screen name="vehicles/[id]/edit" options={{ headerShown: true, title: 'Edit Kendaraan' }} />
          <Stack.Screen name="transactions/[id]" options={{ headerShown: true, title: 'Detail Transaksi' }} />
          <Stack.Screen name="transactions/create" options={{ headerShown: true, title: 'Transaksi Baru' }} />
          <Stack.Screen name="transactions/[id]/status" options={{ headerShown: true, title: 'Update Status' }} />
          <Stack.Screen name="transactions/[id]/finalize" options={{ headerShown: true, title: 'Finalisasi' }} />
          <Stack.Screen name="transactions/[id]/close" options={{ headerShown: true, title: 'Tutup Transaksi' }} />
          <Stack.Screen name="branches/index" options={{ headerShown: true, title: 'Cabang' }} />
          <Stack.Screen name="settings/profile" options={{ headerShown: true, title: 'Profil' }} />
          <Stack.Screen name="settings/branding" options={{ headerShown: true, title: 'Branding Tenant' }} />
          <Stack.Screen name="settings/whatsapp" options={{ headerShown: true, title: 'Template WhatsApp' }} />
          <Stack.Screen name="settings/pricing" options={{ headerShown: true, title: 'Aturan Harga' }} />
          <Stack.Screen name="settings/subscription" options={{ headerShown: true, title: 'Langganan' }} />
        </Stack>
      </AuthGuard>
    </AppProvider>
  );
}

