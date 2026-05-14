import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useDashboardKpis } from '@/modules/dashboard/hooks/useDashboard';
import { useBranches, useSelectBranch } from '@/modules/branches/hooks/useBranches';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '@/theme';
import { STATUS_COLORS } from '@/shared/constants';

function KpiCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[styles.kpiCard, Shadow.sm]}>
      <View style={[styles.kpiIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const selectedBranch = useAuthStore((s) => s.selectedBranch);
  const { data: kpis, isLoading, refetch } = useDashboardKpis();
  const { data: branches } = useBranches();
  const { selectBranch } = useSelectBranch();
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, {user?.name || 'Bureau'}!</Text>
          <Text style={styles.tenantName}>{user?.tenantName || 'STNK Bureau'}</Text>
        </View>
        <Pressable style={styles.branchBtn} onPress={() => setBranchModalVisible(true)}>
          <Ionicons name="business-outline" size={16} color={Colors.primary} />
          <Text style={styles.branchBtnText}>{selectedBranch?.name || 'Semua Cabang'}</Text>
          <Ionicons name="chevron-down" size={14} color={Colors.primary} />
        </Pressable>
      </View>

      {/* KPI Grid */}
      {isLoading ? (
        <View style={styles.loadingGrid}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <View key={n} style={[styles.kpiCard, styles.kpiSkeleton]} />
          ))}
        </View>
      ) : (
        <View style={styles.grid}>
          <KpiCard
            icon="cash-outline"
            label="Revenue Hari Ini"
            value={formatRupiah(kpis?.revenueToday ?? 0)}
            color={Colors.success}
          />
          <KpiCard
            icon="trending-up-outline"
            label="Revenue Bulanan"
            value={formatRupiah(kpis?.monthlyRevenue ?? 0)}
            color={Colors.info}
          />
          <KpiCard
            icon="wallet-outline"
            label="Total Profit"
            value={formatRupiah(0)}
            color={Colors.primary}
          />
          <KpiCard
            icon="return-down-back-outline"
            label="Total Refund"
            value={formatRupiah(kpis?.totalRefund ?? 0)}
            color={Colors.danger}
          />
          <KpiCard
            icon="hourglass-outline"
            label="Transaksi Aktif"
            value={`${kpis?.activeTransactions ?? 0}`}
            color={Colors.warning}
          />
          <KpiCard
            icon="checkmark-circle-outline"
            label="Siap Diambil"
            value={`${kpis?.readyPickupCount ?? 0}`}
            color={Colors.success}
          />
          <KpiCard
            icon="alert-circle-outline"
            label="Terlambat"
            value={`${kpis?.overdueTransactions ?? 0}`}
            color={Colors.danger}
          />
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.actionBtn}
            onPress={() => router.push('/transactions/create')}
          >
            <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
            <Text style={styles.actionLabel}>Transaksi Baru</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => router.push('/customers/index')}
          >
            <Ionicons name="people-outline" size={28} color={Colors.info} />
            <Text style={styles.actionLabel}>Pelanggan</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => router.push('/vehicles/index')}
          >
            <Ionicons name="car-outline" size={28} color={Colors.warning} />
            <Text style={styles.actionLabel}>Kendaraan</Text>
          </Pressable>
        </View>
      </View>

      {/* Branch Modal */}
      <Modal
        visible={branchModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBranchModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setBranchModalVisible(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Pilih Cabang</Text>
            <Pressable
              style={[
                styles.branchItem,
                !selectedBranch && styles.branchItemSelected,
              ]}
              onPress={() => {
                selectBranch(null);
                setBranchModalVisible(false);
              }}
            >
              <Ionicons name="globe-outline" size={20} color={Colors.primary} />
              <Text style={styles.branchItemText}>Semua Cabang</Text>
              {!selectedBranch && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
            </Pressable>
            <FlatList
              data={branches}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.branchItem,
                    selectedBranch?.id === item.id && styles.branchItemSelected,
                  ]}
                  onPress={() => {
                    selectBranch(item);
                    setBranchModalVisible(false);
                  }}
                >
                  <Ionicons name="business-outline" size={20} color={Colors.textSecondary} />
                  <Text style={styles.branchItemText}>{item.name}</Text>
                  {selectedBranch?.id === item.id && (
                    <Ionicons name="checkmark" size={18} color={Colors.primary} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: { ...Typography.h4, color: Colors.text },
  tenantName: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  branchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  branchBtnText: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  kpiCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  kpiSkeleton: {
    height: 90,
    backgroundColor: Colors.divider,
  },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  kpiValue: { ...Typography.h4, color: Colors.text },
  kpiLabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  section: {
    backgroundColor: Colors.surface,
    margin: Spacing.sm,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  sectionTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.md },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionLabel: { ...Typography.bodySmall, color: Colors.text, fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: Spacing.lg,
    maxHeight: '70%',
  },
  modalTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.md },
  branchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  branchItemSelected: { backgroundColor: Colors.primary + '10' },
  branchItemText: { ...Typography.body, color: Colors.text, flex: 1 },
});
