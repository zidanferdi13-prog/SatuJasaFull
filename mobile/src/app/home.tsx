import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useDashboardKpis } from '../modules/dashboard/hooks/useDashboard';
import { KpiCard } from '../shared/components/KpiCard';
import { LoadingState } from '../shared/components/LoadingState';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { data: kpis, isLoading, refetch } = useDashboardKpis();

  if (isLoading) return <LoadingState message="Memuat dashboard..." />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Halo, {user?.name || 'Bureau'}</Text>
        <Text style={styles.subtext}>STNK Bureau Dashboard</Text>
      </View>

      <View style={styles.grid}>
        <KpiCard
          icon="cash-outline"
          iconColor="#4CAF50"
          label="Revenue Today"
          value={`Rp ${(kpis?.revenueToday || 0).toLocaleString('id-ID')}`}
          borderColor="#4CAF50"
        />
        <KpiCard
          icon="document-text-outline"
          iconColor="#FF9800"
          label="Active"
          value={`${kpis?.activeTransactions || 0}`}
          borderColor="#FF9800"
        />
        <KpiCard
          icon="checkmark-circle-outline"
          iconColor="#2196F3"
          label="Ready Pickup"
          value={`${kpis?.readyPickupCount || 0}`}
          borderColor="#2196F3"
        />
        <KpiCard
          icon="trending-up-outline"
          iconColor="#9C27B0"
          label="Monthly Revenue"
          value={`Rp ${(kpis?.monthlyRevenue || 0).toLocaleString('id-ID')}`}
          borderColor="#9C27B0"
        />
      </View>

      <Pressable style={styles.refreshBtn} onPress={() => refetch()}>
        <Ionicons name="refresh" size={20} color="#007AFF" />
        <Text style={styles.refreshText}>Refresh</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 24 },
  greeting: { fontSize: 26, fontWeight: '700', color: 'white' },
  subtext: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  grid: { padding: 16 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12 },
  refreshText: { marginLeft: 6, color: '#007AFF', fontWeight: '600' },
});
