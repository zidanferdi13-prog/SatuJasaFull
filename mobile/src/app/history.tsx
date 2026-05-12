import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { transactionAPI } from '../api/transactions';
import { Ionicons } from '@expo/vector-icons';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#9E9E9E',
  ON_PROCESS: '#FF9800',
  READY_TO_PICKUP: '#2196F3',
  COMPLETED: '#4CAF50',
  CLOSED: '#333',
};

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await transactionAPI.list();
      setTransactions(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#007AFF" /></View>;

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<View style={styles.center}><Ionicons name="inbox-outline" size={48} color="#ccc" /><Text style={{ color: '#999', marginTop: 8 }}>No transactions</Text></View>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.customer?.name || '-'}</Text>
              <Text style={styles.invoice}>{item.invoiceNumber}</Text>
            </View>
            <Text style={styles.amount}>Rp {Number(item.finalTotal || 0).toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('id-ID')}</Text>
            <Text style={[styles.status, { color: STATUS_COLORS[item.status] || '#999' }]}>{item.status}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  list: { padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  name: { fontSize: 15, fontWeight: '600', color: '#333' },
  invoice: { fontSize: 12, color: '#007AFF', marginTop: 2, fontFamily: 'monospace' },
  amount: { fontSize: 15, fontWeight: '700', color: '#333' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  date: { fontSize: 12, color: '#999' },
  status: { fontSize: 12, fontWeight: '700' },
});
