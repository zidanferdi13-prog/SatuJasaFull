import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTransactionStore } from '../store/transactionStore';
import { transactionAPI } from '../api/transactions';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { dailyRevenue, pendingCount, setDailyRevenue, setPendingCount } = useTransactionStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await transactionAPI.list(100);
      const transactions = response.data || [];

      const pending = transactions.filter((t: any) => t.status === 'PENDING').length;
      const completed = transactions.filter((t: any) => t.status === 'COMPLETED');
      const revenue = completed.reduce((sum: number, t: any) => sum + (t.final_price || 0), 0);

      setPendingCount(pending);
      setDailyRevenue(revenue);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Halo, {user?.full_name || 'Bureau'}</Text>
        <Text style={styles.subtext}>Selamat datang di STNK Bureau</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="cash" size={32} color="#4CAF50" />
          <Text style={styles.statLabel}>Pendapatan Hari Ini</Text>
          <Text style={styles.statValue}>Rp {dailyRevenue.toLocaleString('id-ID')}</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons name="file-document" size={32} color="#FF9800" />
          <Text style={styles.statLabel}>Menunggu Proses</Text>
          <Text style={styles.statValue}>{pendingCount} Transaksi</Text>
        </View>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <Pressable style={styles.actionButton}>
          <MaterialCommunityIcons name="plus-circle" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>Buat Transaksi Baru</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <MaterialCommunityIcons name="history" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>Lihat Riwayat</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <MaterialCommunityIcons name="refresh" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText} onPress={loadDashboard}>
            Segarkan Data
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  subtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 6,
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
});
