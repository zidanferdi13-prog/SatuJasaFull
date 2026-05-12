import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { transactionAPI } from '../api/transactions';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const [kpis, setKpis] = useState({ revenueToday: 0, activeTransactions: 0, readyPickupCount: 0, monthlyRevenue: 0 });

  useEffect(() => { loadKpis(); }, []);

  const loadKpis = async () => {
    try {
      const data = await transactionAPI.getDashboardKpis();
      setKpis(data);
    } catch (err) { console.error('Dashboard error:', err); }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Halo, {user?.name || 'Bureau'}</Text>
        <Text style={styles.subtext}>STNK Bureau Dashboard</Text>
      </View>

      <View style={styles.grid}>
        <View style={[styles.card, { borderLeftColor: '#4CAF50' }]}>
          <Ionicons name="cash-outline" size={28} color="#4CAF50" />
          <Text style={styles.cardLabel}>Revenue Today</Text>
          <Text style={styles.cardValue}>Rp {(kpis.revenueToday || 0).toLocaleString('id-ID')}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#FF9800' }]}>
          <Ionicons name="document-text-outline" size={28} color="#FF9800" />
          <Text style={styles.cardLabel}>Active</Text>
          <Text style={styles.cardValue}>{kpis.activeTransactions}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#2196F3' }]}>
          <Ionicons name="checkmark-circle-outline" size={28} color="#2196F3" />
          <Text style={styles.cardLabel}>Ready Pickup</Text>
          <Text style={styles.cardValue}>{kpis.readyPickupCount}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#9C27B0' }]}>
          <Ionicons name="trending-up-outline" size={28} color="#9C27B0" />
          <Text style={styles.cardLabel}>Monthly Revenue</Text>
          <Text style={styles.cardValue}>Rp {(kpis.monthlyRevenue || 0).toLocaleString('id-ID')}</Text>
        </View>
      </View>

      <Pressable style={styles.refreshBtn} onPress={loadKpis}>
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
  grid: { padding: 16, gap: 12 },
  card: {
    backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12,
    borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  cardLabel: { fontSize: 13, color: '#999', marginTop: 6 },
  cardValue: { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 4 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12 },
  refreshText: { marginLeft: 6, color: '#007AFF', fontWeight: '600' },
});
