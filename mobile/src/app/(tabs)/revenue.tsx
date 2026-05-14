import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRevenueSummary } from '@/modules/dashboard/hooks/useDashboard';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '@/theme';

function RevenueRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

function KpiBlock({
  icon,
  color,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.kpiBlock, Shadow.sm]}>
      <View style={[styles.kpiIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export default function RevenueScreen() {
  const selectedBranch = useAuthStore((s) => s.selectedBranch);
  const { data, isLoading, refetch } = useRevenueSummary({
    branchId: selectedBranch?.id,
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />}
    >
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <>
          {/* Top KPIs */}
          <View style={styles.grid}>
            <KpiBlock
              icon="cash-outline"
              color={Colors.success}
              label="Total Revenue"
              value={formatRupiah(data?.totalRevenue ?? 0)}
            />
            <KpiBlock
              icon="wallet-outline"
              color={Colors.primary}
              label="Total DP"
              value={formatRupiah(data?.totalDp ?? 0)}
            />
            <KpiBlock
              icon="return-down-back-outline"
              color={Colors.danger}
              label="Total Refund"
              value={formatRupiah(data?.totalRefund ?? 0)}
            />
            <KpiBlock
              icon="checkmark-done-outline"
              color={Colors.info}
              label="Transaksi Selesai"
              value={`${data?.transactionCount ?? 0}`}
            />
          </View>

          {/* Branch Revenue */}
          {data?.branchRevenue && data.branchRevenue.length > 0 && (
            <View style={[styles.card, Shadow.sm]}>
              <Text style={styles.cardTitle}>Revenue per Cabang</Text>
              {data.branchRevenue.map((b) => (
                <RevenueRow
                  key={b.branchId}
                  label={b.branchName}
                  value={formatRupiah(b.revenue)}
                />
              ))}
            </View>
          )}

          {/* Monthly Revenue */}
          {data?.monthlyRevenue && data.monthlyRevenue.length > 0 && (
            <View style={[styles.card, Shadow.sm]}>
              <Text style={styles.cardTitle}>Revenue Bulanan</Text>
              {data.monthlyRevenue.map((m) => (
                <RevenueRow key={m.month} label={m.month} value={formatRupiah(m.revenue)} />
              ))}
            </View>
          )}

          {!data && (
            <View style={styles.center}>
              <Ionicons name="stats-chart-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>Belum ada data revenue</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  kpiBlock: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
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
  card: {
    backgroundColor: Colors.surface,
    margin: Spacing.sm,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  cardTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowLabel: { ...Typography.body, color: Colors.textSecondary },
  rowValue: { ...Typography.body, color: Colors.text, fontWeight: '500' },
  bold: { fontWeight: '700', color: Colors.text },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  emptyText: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.md },
});
