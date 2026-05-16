import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useDashboardKpis } from '@/modules/dashboard/hooks/useDashboard';
import { useTransactions } from '@/modules/transactions/hooks/useTransactions';
import { Colors, Spacing, Shadow, BorderRadius } from '@/theme';
import { STATUS_COLORS, STATUS_LABELS } from '@/shared/constants';
import { Transaction } from '@/shared/types';

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatRelativeTime(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes}m lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;
  if (hours < 48) return 'kemarin';
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

function getPrimaryItem(transaction: Transaction) {
  return transaction.items?.[0];
}

function isTransactionOverdue(transaction: Transaction) {
  if (!transaction.estimatedFinishDate) return false;
  const activeStatus = transaction.status === 'ON_PROCESS' || transaction.status === 'READY_TO_PICKUP';
  return activeStatus && new Date(transaction.estimatedFinishDate).getTime() < Date.now();
}

function KpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.kpiCard}>
      <View style={styles.kpiIconBox}>
        <Ionicons name={icon} size={20} color={Colors.primaryDark} />
      </View>
      <View>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={styles.kpiValue}>{value}</Text>
      </View>
    </View>
  );
}

function MonitorRow({ transaction, onPress }: { transaction: Transaction; onPress: () => void }) {
  const item = getPrimaryItem(transaction);
  const overdue = isTransactionOverdue(transaction);
  const statusColor = overdue ? Colors.danger : STATUS_COLORS[transaction.status] || Colors.textSecondary;
  const plateNumber = item?.vehicle?.plateNumber || transaction.invoiceNumber;
  const vehicleName = [item?.vehicle?.brand, item?.vehicle?.model].filter(Boolean).join(' ');
  const serviceName = item?.serviceType?.name || 'Layanan STNK';
  const subtitle = [vehicleName, transaction.customer?.name, serviceName].filter(Boolean).join(' • ');
  const statusLabel = overdue ? 'OVERDUE' : STATUS_LABELS[transaction.status] || transaction.status;

  return (
    <Pressable style={styles.monitorRow} onPress={onPress}>
      <View style={[styles.monitorIconBox, overdue && styles.monitorIconBoxDanger]}>
        <Ionicons name={overdue ? 'warning-outline' : 'car-outline'} size={24} color={overdue ? Colors.danger : Colors.textSecondary} />
      </View>
      <View style={styles.monitorContent}>
        <View style={styles.monitorTopRow}>
          <Text style={styles.monitorPlate} numberOfLines={1}>{plateNumber}</Text>
          <Text style={styles.monitorTime}>{formatRelativeTime(transaction.updatedAt || transaction.createdAt)}</Text>
        </View>
        <Text style={styles.monitorSubtitle} numberOfLines={1}>{subtitle}</Text>
        <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
          <Text style={[styles.statusPillText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
    </Pressable>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: kpis, isLoading, refetch } = useDashboardKpis();
  const {
    data: monitorTransactions,
    isLoading: isMonitorLoading,
    refetch: refetchMonitor,
  } = useTransactions({ page: 1, limit: 3, sort: 'created_at:desc' });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchMonitor()]);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={[styles.revenueCard, Shadow.sm]}>
          <View style={styles.revenueHeader}>
            <Text style={styles.revenueLabel}>Pendapatan Jasa Hari Ini</Text>
            <View style={styles.revenueIconBox}>
              <Ionicons name="cash" size={22} color={Colors.primaryDark} />
            </View>
          </View>
          <View style={styles.revenueValueRow}>
            <Text style={styles.revenueValue}>{isLoading ? '-' : formatRupiah(kpis?.revenueToday ?? 0)}</Text>
            <View style={styles.revenueBadge}>
              <Ionicons name="trending-up-outline" size={13} color={Colors.primaryDark} />
              <Text style={styles.revenueBadgeText}>Jasa</Text>
            </View>
          </View>
          <Text style={styles.revenueHint}>Total margin jasa dari transaksi yang ditutup hari ini.</Text>
        </View>

        <View style={styles.kpiGrid}>
          <KpiCard icon="document-text-outline" label="Aktif" value={`${kpis?.activeTransactions ?? 0}`} />
          <KpiCard icon="archive-outline" label="Siap Ambil" value={`${kpis?.readyPickupCount ?? 0}`} />
        </View>

        <View style={[styles.monthlyCard, Shadow.sm]}>
          <View>
            <Text style={styles.monthlyLabel}>Pendapatan Jasa Bulan Ini</Text>
            <Text style={styles.monthlyValue}>{isLoading ? '-' : formatRupiah(kpis?.monthlyRevenue ?? 0)}</Text>
          </View>
          <Ionicons name="calendar-outline" size={24} color={Colors.primaryDark} />
        </View>

        {(kpis?.overdueTransactions ?? 0) > 0 && (
          <View style={styles.overdueCard}>
            <View style={styles.overdueIconBox}>
              <Ionicons name="warning" size={22} color="#fff" />
            </View>
            <View style={styles.overdueInfo}>
              <Text style={styles.overdueTitle}>Overdue ({kpis?.overdueTransactions ?? 0} Berkas)</Text>
              <Text style={styles.overdueText}>Segera tindaklanjuti berkas yang melewati batas estimasi.</Text>
            </View>
            <Pressable style={styles.overdueButton} onPress={() => router.push('/transactions/index')}>
              <Text style={styles.overdueButtonText}>DETAIL</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monitor Berkas</Text>
          <Pressable onPress={() => router.push('/transactions')}>
            <Text style={styles.viewAllText}>LIHAT SEMUA</Text>
          </Pressable>
        </View>

        <View style={[styles.monitorCard, Shadow.sm]}>
          {isMonitorLoading ? (
            <View style={styles.monitorState}>
              <ActivityIndicator color={Colors.primaryDark} />
              <Text style={styles.monitorStateText}>Memuat berkas...</Text>
            </View>
          ) : monitorTransactions && monitorTransactions.length > 0 ? (
            monitorTransactions.map((transaction) => (
              <MonitorRow
                key={transaction.id}
                transaction={transaction}
                onPress={() => router.push(`/transactions/${transaction.id}` as `/${string}`)}
              />
            ))
          ) : (
            <View style={styles.monitorState}>
              <Ionicons name="folder-open-outline" size={34} color={Colors.textLight} />
              <Text style={styles.monitorStateTitle}>Belum ada berkas terbaru</Text>
              <Text style={styles.monitorStateText}>Transaksi yang dibuat akan muncul di sini.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push('/transactions/create')}>
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingTop: Spacing['2xl'], paddingBottom: 118 },
  tenantLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: Colors.primaryDark,
    marginBottom: Spacing.xs,
  },
  pageTitle: { fontSize: 34, lineHeight: 40, fontWeight: '900', color: Colors.text, letterSpacing: -0.8 },
  pageSubtitle: { fontSize: 16, lineHeight: 24, color: Colors.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.xl },
  revenueCard: {
    borderWidth: 1,
    borderColor: '#C3C6D6',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  revenueHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  revenueLabel: { fontSize: 12, lineHeight: 16, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.textSecondary },
  revenueIconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  revenueValueRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  revenueValue: { fontSize: 34, lineHeight: 42, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  revenueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
  },
  revenueBadgeText: { fontSize: 11, fontWeight: '900', color: Colors.primaryDark },
  revenueHint: { fontSize: 13, lineHeight: 18, color: Colors.textSecondary, marginTop: Spacing.lg },
  kpiGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  kpiCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#C3C6D6',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    ...Shadow.sm,
  },
  kpiIconBox: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  kpiLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', color: Colors.textSecondary },
  kpiValue: { fontSize: 24, lineHeight: 30, fontWeight: '900', color: Colors.text, marginTop: 2 },
  monthlyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#C3C6D6',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.xl,
  },
  monthlyLabel: { fontSize: 12, fontWeight: '900', letterSpacing: 1.1, textTransform: 'uppercase', color: Colors.textSecondary },
  monthlyValue: { fontSize: 24, lineHeight: 32, fontWeight: '900', color: Colors.text, marginTop: 4 },
  overdueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFB4AB',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    backgroundColor: Colors.dangerLight,
    marginBottom: Spacing.xl,
  },
  overdueIconBox: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.danger,
  },
  overdueInfo: { flex: 1 },
  overdueTitle: { fontSize: 16, lineHeight: 22, fontWeight: '900', color: '#93000A' },
  overdueText: { fontSize: 12, lineHeight: 17, color: '#93000A', marginTop: 2 },
  overdueButton: { paddingHorizontal: Spacing.sm, paddingVertical: 8, borderRadius: BorderRadius.md },
  overdueButtonText: { color: Colors.danger, fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: Colors.text },
  viewAllText: { fontSize: 12, color: Colors.primaryDark, fontWeight: '900', letterSpacing: 0.8 },
  monitorCard: {
    borderWidth: 1,
    borderColor: '#C3C6D6',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  monitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  monitorIconBox: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#DDE8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monitorIconBoxDanger: { backgroundColor: Colors.dangerLight },
  monitorContent: { flex: 1, minWidth: 0 },
  monitorTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm, marginBottom: 2 },
  monitorPlate: { flex: 1, fontSize: 17, lineHeight: 23, fontWeight: '900', color: Colors.text },
  monitorTime: { fontSize: 10, fontWeight: '900', color: Colors.textSecondary, textTransform: 'uppercase' },
  monitorSubtitle: { fontSize: 13, lineHeight: 18, color: Colors.textSecondary, marginBottom: Spacing.xs },
  statusPill: { alignSelf: 'flex-start', borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  statusPillText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.7, textTransform: 'uppercase' },
  monitorState: { alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'], gap: Spacing.sm },
  monitorStateTitle: { fontSize: 16, fontWeight: '900', color: Colors.text },
  monitorStateText: { fontSize: 13, lineHeight: 18, color: Colors.textSecondary, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 60,
    height: 60,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
});
