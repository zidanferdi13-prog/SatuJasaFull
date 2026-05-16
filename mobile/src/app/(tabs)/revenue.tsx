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
import { Colors, Spacing, Shadow, BorderRadius } from '@/theme';

function RevenueRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowDot} />
      <Text style={[styles.rowLabel, bold && styles.bold]} numberOfLines={1}>{label}</Text>
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
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export default function RevenueScreen() {
  const { data, isLoading, refetch } = useRevenueSummary();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />}
    >
      <View style={styles.heroCard}>
        <View>
          <Text style={styles.eyebrow}>Revenue Center</Text>
          <Text style={styles.heroTitle}>Pendapatan Jasa</Text>
          <Text style={styles.heroSubtitle}>Pantau margin, DP, refund, dan performa transaksi biro.</Text>
        </View>
        <View style={styles.heroIcon}>
          <Ionicons name="analytics-outline" size={26} color={Colors.primaryDark} />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerCard}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
          <Text style={styles.centerText}>Memuat revenue...</Text>
        </View>
      ) : (
        <>
          <View style={styles.grid}>
            <KpiBlock
              icon="cash-outline"
              color={Colors.success}
              label="Total Pendapatan Jasa"
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

          {/* Revenue Breakdown */}
          {data?.branchRevenue && data.branchRevenue.length > 0 && (
            <View style={[styles.card, Shadow.sm]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Rincian Pendapatan Jasa</Text>
                <Ionicons name="business-outline" size={20} color={Colors.primaryDark} />
              </View>
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
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Pendapatan Jasa Bulanan</Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.primaryDark} />
              </View>
              {data.monthlyRevenue.map((m) => (
                <RevenueRow key={m.month} label={m.month} value={formatRupiah(m.revenue)} />
              ))}
            </View>
          )}

          {!data && (
            <View style={styles.centerCard}>
              <Ionicons name="stats-chart-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>Belum ada data revenue</Text>
              <Text style={styles.centerText}>Transaksi yang ditutup akan masuk ke ringkasan ini.</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingTop: Spacing['2xl'], paddingBottom: 104, gap: Spacing.md },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#C3C6D6',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    ...Shadow.sm,
  },
  eyebrow: { fontSize: 12, fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.primaryDark, marginBottom: 4 },
  heroTitle: { fontSize: 30, lineHeight: 36, fontWeight: '900', color: Colors.text, letterSpacing: -0.7 },
  heroSubtitle: { maxWidth: 250, fontSize: 14, lineHeight: 20, color: Colors.textSecondary, marginTop: Spacing.xs },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  kpiBlock: {
    width: '47.8%',
    minHeight: 136,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#C3C6D6',
  },
  kpiIcon: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  kpiValue: { fontSize: 20, lineHeight: 27, fontWeight: '900', color: Colors.text, letterSpacing: -0.4, marginTop: 4 },
  kpiLabel: { fontSize: 10, lineHeight: 14, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: '#C3C6D6',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  cardTitle: { fontSize: 20, lineHeight: 26, fontWeight: '900', color: Colors.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryLight },
  rowLabel: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '700', color: Colors.textSecondary },
  rowValue: { fontSize: 14, lineHeight: 20, color: Colors.text, fontWeight: '900' },
  bold: { fontWeight: '900', color: Colors.text },
  centerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
    borderWidth: 1,
    borderColor: '#C3C6D6',
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: Colors.text },
  centerText: { fontSize: 13, lineHeight: 19, color: Colors.textSecondary, textAlign: 'center' },
});
