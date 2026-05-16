import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useDashboardKpis } from '@/modules/dashboard/hooks/useDashboard';
import { Colors, Spacing, Shadow, BorderRadius } from '@/theme';
import { STATUS_COLORS } from '@/shared/constants';

function MiniKpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.miniCard}>
      <View style={styles.miniHeader}>
        <Ionicons name={icon} size={16} color={Colors.textSecondary} />
        <Text style={styles.miniLabel}>{label}</Text>
      </View>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
}

function FileMonitorRow({
  icon,
  plate,
  subtitle,
  status,
  statusColor,
  time,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  plate: string;
  subtitle: string;
  status: string;
  statusColor: string;
  time: string;
}) {
  return (
    <View style={styles.fileRow}>
      <View style={styles.fileIconBox}>
        <Ionicons name={icon} size={22} color={Colors.textSecondary} />
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.filePlate}>{plate}</Text>
        <Text style={styles.fileSubtitle}>{subtitle}</Text>
        <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
          <Text style={[styles.statusPillText, { color: statusColor }]}>{status}</Text>
        </View>
      </View>
      <Text style={styles.fileTime}>{time}</Text>
    </View>
  );
}

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: kpis, isLoading, refetch } = useDashboardKpis();
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
      <View style={styles.content}>
        <Text style={styles.tenantLabel}>{user?.tenantName || 'STNK Bureau'}</Text>
        <Text style={styles.pageTitle}>Ringkasan Operasional</Text>
        <Text style={styles.pageSubtitle}>Ikhtisar harian status layanan dan pendapatan.</Text>

        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <Text style={styles.revenueLabel}>Pendapatan Hari Ini</Text>
            <Ionicons name="cash-outline" size={26} color={Colors.primaryDark} />
          </View>
          <Text style={styles.revenueValue}>{isLoading ? '-' : formatRupiah(kpis?.revenueToday ?? 0)}</Text>
          <View style={styles.trendRow}>
            <Ionicons name="trending-up-outline" size={16} color={Colors.primary} />
            <Text style={styles.trendText}>Revenue jasa biro hari ini</Text>
          </View>
        </View>

        <View style={styles.miniGrid}>
          <MiniKpiCard icon="receipt-outline" label="Transaksi Aktif" value={`${kpis?.activeTransactions ?? 0}`} />
          <MiniKpiCard icon="archive-outline" label="Siap Ambil" value={`${kpis?.readyPickupCount ?? 0}`} />
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Target Bulanan</Text>
            <Text style={styles.progressPercent}>82%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {(kpis?.overdueTransactions ?? 0) > 0 && (
          <View style={styles.overdueCard}>
            <Ionicons name="warning-outline" size={30} color={Colors.danger} />
            <View style={styles.overdueInfo}>
              <Text style={styles.overdueTitle}>Overdue ({kpis?.overdueTransactions ?? 0} Berkas)</Text>
              <Text style={styles.overdueText}>Terdapat berkas yang telah melewati batas waktu estimasi. Mohon segera ditindaklanjuti.</Text>
            </View>
            <Pressable style={styles.overdueButton} onPress={() => router.push('/transactions/index')}>
              <Text style={styles.overdueButtonText}>Lihat Detail</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monitor Berkas</Text>
          <Pressable onPress={() => router.push('/transactions/index')}>
            <Text style={styles.viewAllText}>Lihat Semua</Text>
          </Pressable>
        </View>

        <View style={styles.fileCard}>
          <FileMonitorRow
            icon="car-outline"
            plate="Transaksi aktif"
            subtitle={`${kpis?.activeTransactions ?? 0} berkas sedang diproses`}
            status="TERVERIFIKASI"
            statusColor={Colors.success}
            time="hari ini"
          />
          <FileMonitorRow
            icon="bicycle-outline"
            plate="Siap diambil"
            subtitle={`${kpis?.readyPickupCount ?? 0} berkas menunggu pickup`}
            status="PROSES SAMSAT"
            statusColor={Colors.warning}
            time="terbaru"
          />
          <FileMonitorRow
            icon="bus-outline"
            plate="Overdue"
            subtitle={`${kpis?.overdueTransactions ?? 0} berkas butuh perhatian`}
            status="OVERDUE"
            statusColor={Colors.danger}
            time="urgent"
          />
        </View>
      </View>

      <Pressable style={styles.fab} onPress={() => router.push('/transactions/create')}>
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingTop: Spacing['2xl'], paddingBottom: 110 },
  tenantLabel: { fontSize: 13, fontWeight: '900', letterSpacing: 1.8, textTransform: 'uppercase', color: Colors.primaryDark, marginBottom: Spacing.sm },
  pageTitle: { fontSize: 32, lineHeight: 38, fontWeight: '900', color: Colors.text },
  pageSubtitle: { fontSize: 18, lineHeight: 26, color: Colors.textSecondary, marginTop: Spacing.sm, marginBottom: Spacing['2xl'] },
  revenueCard: {
    borderWidth: 1,
    borderColor: '#B8C2D6',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.lg,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  revenueLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase', color: Colors.textSecondary },
  revenueValue: { fontSize: 38, lineHeight: 46, fontWeight: '900', color: Colors.text, marginBottom: Spacing['2xl'] },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  trendText: { fontSize: 17, color: Colors.primary, fontWeight: '600' },
  miniGrid: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.lg },
  miniCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#B8C2D6',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  miniHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  miniLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.textSecondary },
  miniValue: { fontSize: 30, fontWeight: '900', color: Colors.text },
  progressCard: {
    borderWidth: 1,
    borderColor: '#B8C2D6',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    marginBottom: Spacing['2xl'],
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  progressLabel: { fontSize: 15, fontWeight: '800', letterSpacing: 1.7, textTransform: 'uppercase', color: Colors.textSecondary },
  progressPercent: { fontSize: 26, fontWeight: '900', color: Colors.primaryDark },
  progressTrack: { height: 10, borderRadius: 999, backgroundColor: Colors.primaryLight, overflow: 'hidden' },
  progressFill: { width: '82%', height: '100%', borderRadius: 999, backgroundColor: Colors.primaryDark },
  overdueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#FF8A8A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    backgroundColor: '#FFD9D4',
    marginBottom: Spacing['2xl'],
  },
  overdueInfo: { flex: 1 },
  overdueTitle: { fontSize: 20, fontWeight: '800', color: '#9B0000', marginBottom: Spacing.sm },
  overdueText: { fontSize: 17, lineHeight: 24, color: '#9B0000' },
  overdueButton: {
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFE8E5',
  },
  overdueButtonText: { color: Colors.danger, fontWeight: '800', textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 26, fontWeight: '800', color: Colors.text },
  viewAllText: { fontSize: 15, color: Colors.primaryDark, fontWeight: '800' },
  fileCard: {
    borderWidth: 1,
    borderColor: '#B8C2D6',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  fileIconBox: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#DDE8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: { flex: 1 },
  filePlate: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  fileSubtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: Spacing.sm },
  statusPill: { alignSelf: 'flex-start', borderRadius: 3, paddingHorizontal: Spacing.sm, paddingVertical: 5 },
  statusPillText: { fontSize: 12, fontWeight: '900', letterSpacing: 1.1 },
  fileTime: { fontSize: 16, color: Colors.textSecondary },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
});
