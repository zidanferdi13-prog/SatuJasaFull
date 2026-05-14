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
import { useAuthStore } from '@/store/authStore';
import { Transaction, TransactionStatus } from '@/shared/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/shared/constants';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '@/theme';

const STATUS_FILTERS: Array<{ label: string; value: TransactionStatus | undefined }> = [
  { label: 'Semua', value: undefined },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Proses', value: 'ON_PROCESS' },
  { label: 'Siap', value: 'READY_TO_PICKUP' },
  { label: 'Selesai', value: 'COMPLETED' },
  { label: 'Tutup', value: 'CLOSED' },
];

function TransactionCard({ item, onPress }: { item: Transaction; onPress: () => void }) {
  const statusColor = STATUS_COLORS[item.status] || Colors.textLight;
  return (
    <Pressable style={[styles.card, Shadow.sm]} onPress={onPress}>
      <View style={styles.cardRow}>
        <Text style={styles.invoiceNum}>{item.invoiceNumber}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {STATUS_LABELS[item.status]}
          </Text>
        </View>
      </View>
      <Text style={styles.customerName}>{item.customer?.name || '-'}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.meta}>
          {item.items?.length ?? 0} kendaraan
        </Text>
        <Text style={styles.amount}>
          Rp {(item.estimatedTotal || 0).toLocaleString('id-ID')}
        </Text>
      </View>
      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </Text>
    </Pressable>
  );
}

export default function TransactionsScreen() {
  const router = useRouter();
  const selectedBranch = useAuthStore((s) => s.selectedBranch);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | undefined>(undefined);

  const { data: transactions, isLoading, refetch } = useTransactions({
    search: search.length >= 2 ? search : undefined,
    status: statusFilter,
    branchId: selectedBranch?.id,
  });

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nomor invoice, nama pelanggan, plat..."
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

      {/* Status Filters */}
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

      {/* Transaction List */}
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
            <View style={styles.center}>
              <Ionicons name="document-text-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>Belum ada transaksi</Text>
            </View>
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/transactions/create')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  filterList: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.xs,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: { ...Typography.bodySmall, color: Colors.textSecondary },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  listContent: { padding: Spacing.sm, paddingBottom: 80 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invoiceNum: { ...Typography.body, fontWeight: '700', color: Colors.text },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  customerName: { ...Typography.body, color: Colors.text },
  meta: { ...Typography.bodySmall, color: Colors.textSecondary },
  amount: { ...Typography.body, fontWeight: '600', color: Colors.text },
  date: { ...Typography.caption, color: Colors.textLight },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'] },
  emptyText: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.md },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
});
