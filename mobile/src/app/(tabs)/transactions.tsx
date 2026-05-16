import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '@/modules/transactions/hooks/useTransactions';
import { Transaction, TransactionStatus } from '@/shared/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/shared/constants';
import { Colors, Spacing, Shadow, BorderRadius } from '@/theme';

const STATUS_FILTERS: Array<{ label: string; value: TransactionStatus | undefined }> = [
  { label: 'Semua', value: undefined },
  { label: 'Dalam Proses', value: 'ON_PROCESS' },
  { label: 'Siap Ambil', value: 'READY_TO_PICKUP' },
  { label: 'Selesai', value: 'COMPLETED' },
  { label: 'Ditutup', value: 'CLOSED' },
];

function TransactionCard({ item, onPress }: { item: Transaction; onPress: () => void }) {
  const statusColor = STATUS_COLORS[item.status] || Colors.textLight;
  const primaryItem = item.items?.[0];
  const plateNumber = primaryItem?.vehicle?.plateNumber || item.invoiceNumber;
  const serviceName = primaryItem?.serviceType?.name || `${item.items?.length ?? 0} kendaraan`;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.plateNumber}>{plateNumber}</Text>
          <Text style={styles.invoiceNum}>{item.invoiceNumber}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor + '16', borderColor: statusColor + '55' }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardMetaRow}>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Pemilik</Text>
          <Text style={styles.metaValue}>{item.customer?.name || '-'}</Text>
        </View>
        <View style={[styles.metaBlock, styles.metaBlockRight]}>
          <Text style={styles.metaLabel}>Layanan</Text>
          <Text style={styles.metaValue}>{serviceName}</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
        <Text style={styles.amount}>Rp {(item.estimatedTotal || 0).toLocaleString('id-ID')}</Text>
      </View>
    </Pressable>
  );
}

export default function TransactionsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | undefined>(undefined);

  const { data: transactions, isLoading, refetch } = useTransactions({
    search: search.length >= 2 ? search : undefined,
    status: statusFilter,
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color={Colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Plat, invoice, atau nama"
              placeholderTextColor={Colors.textLight}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textLight} />
              </Pressable>
            )}
          </View>
          <Pressable style={styles.tuneButton}>
            <Ionicons name="options-outline" size={22} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.label}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.filterChip,
                statusFilter === item.value && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionCard
              item={item}
              onPress={() => router.push(`/transactions/${item.id}` as `/${string}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={42} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>Belum ada transaksi</Text>
              <Text style={styles.emptyText}>Transaksi yang dibuat akan muncul di sini.</Text>
            </View>
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() => router.push('/transactions/create')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#C3C6D6',
    ...Shadow.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text, paddingVertical: 0 },
  tuneButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#C3C6D6',
    ...Shadow.sm,
  },
  filterList: { gap: Spacing.sm, paddingRight: Spacing.lg },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#C3C6D6',
  },
  filterChipActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  filterChipText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, color: Colors.textSecondary },
  filterChipTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 96, gap: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#C3C6D6',
    ...Shadow.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.md },
  cardTitleWrap: { flex: 1, gap: 4 },
  plateNumber: { fontSize: 24, lineHeight: 30, fontWeight: '900', color: Colors.text, letterSpacing: -0.3 },
  invoiceNum: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  badge: {
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.md },
  cardMetaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  metaBlock: { flex: 1, gap: 4 },
  metaBlockRight: { alignItems: 'flex-end' },
  metaLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: Colors.textLight },
  metaValue: { fontSize: 14, lineHeight: 20, color: Colors.text, fontWeight: '600' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  date: { fontSize: 12, color: Colors.textLight, fontWeight: '500' },
  amount: { fontSize: 15, fontWeight: '800', color: Colors.primaryDark },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'] },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#C3C6D6',
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginTop: Spacing.md },
  emptyText: { fontSize: 14, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 58,
    height: 58,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
});
