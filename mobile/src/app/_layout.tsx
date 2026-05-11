import { Tabs } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RootLayout() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <LoginScreenNavigation />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: { [key: string]: string } = {
            home: 'home',
            transaction: 'plus-circle',
            history: 'history',
            settings: 'cog',
          };
          return <MaterialCommunityIcons name={icons[route.name] || 'circle'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        headerStyle: {
          backgroundColor: '#f8f9fa',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="transaction"
        options={{
          title: 'Transaksi Baru',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Pengaturan',
          headerShown: true,
        }}
      />
    </Tabs>
  );
}

function LoginScreenNavigation() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarVisible: false,
      }}
    >
      <Tabs.Screen name="login" options={{ href: null }} />
    </Tabs>
  );
}
