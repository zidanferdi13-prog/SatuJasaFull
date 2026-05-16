import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '@/modules/settings/hooks/useSettings';
import { Colors, Spacing, Shadow, BorderRadius } from '@/theme';

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>{value}</Text>
    </View>
  );
}

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date: Date | null) {
  if (!date) return '-';
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function SubscriptionScreen() {
  const { data: subscription, isLoading, error } = useSubscription();

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.danger} />
        <Text style={styles.emptyText}>Gagal memuat data langganan</Text>
      </View>
    );
  }

  if (!subscription) {
    return (
      <View style={styles.center}>
        <Ionicons name="card-outline" size={48} color={Colors.textLight} />
        <Text style={styles.emptyText}>Tidak ada data langganan</Text>
      </View>
    );
  }

  const latestSubscription = subscription.subscriptions?.[0];
  const startDate = parseDate(subscription.subscriptionStart) || parseDate(latestSubscription?.startDate);
  const endDate = parseDate(subscription.subscriptionEnd) || parseDate(latestSubscription?.endDate);
  const daysRemaining = endDate
    ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isExpiring = daysRemaining !== null && daysRemaining <= 7;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  const planName = latestSubscription?.planName || 'Standard';
  const statusColor = isExpired ? Colors.danger : isExpiring ? Colors.warning : Colors.success;
  const isActive = subscription.subscriptionStatus === 'ACTIVE';
  const statusLabel = isExpired ? 'Kedaluwarsa' : isActive ? 'Aktif' : 'Tidak Aktif';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.statusCard, { backgroundColor: statusColor + '12' }, Shadow.sm]}>
        <View style={[styles.statusIconBox, { backgroundColor: statusColor + '18' }]}>
          <Ionicons
            name={isExpired ? 'close-circle' : isExpiring ? 'warning' : 'checkmark-circle'}
            size={36}
            color={statusColor}
          />
        </View>
        <Text style={styles.eyebrow}>Subscription Status</Text>
        <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
        {daysRemaining !== null && !isExpired && (
          <Text style={[styles.daysText, { color: statusColor }]}>
            {daysRemaining} hari tersisa
          </Text>
        )}
      </View>

      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Detail Langganan</Text>
        <InfoRow label="Tenant" value={subscription.name} />
        <InfoRow label="Paket" value={planName} />
        <InfoRow
          label="Tanggal Mulai"
          value={formatDate(startDate)}
        />
        <InfoRow
          label="Tanggal Berakhir"
          value={formatDate(endDate)}
          highlight={isExpiring}
        />
        <InfoRow
          label="Sisa Hari"
          value={daysRemaining === null ? '-' : `${Math.max(0, daysRemaining)} hari`}
          highlight={isExpiring}
        />
      </View>

      {(isExpiring || isExpired) && (
        <View style={[styles.warningCard]}>
          <Ionicons name="warning-outline" size={20} color={Colors.warning} />
          <Text style={styles.warningText}>
            {isExpired
              ? 'Langganan Anda telah berakhir. Hubungi admin untuk perpanjangan.'
              : `Langganan Anda akan berakhir dalam ${daysRemaining ?? 0} hari. Segera perpanjang untuk menghindari gangguan layanan.`}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingTop: Spacing['2xl'], paddingBottom: 96, gap: Spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'], backgroundColor: Colors.background },
  statusCard: { borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderColor: '#C3C6D6' },
  statusIconBox: { width: 68, height: 68, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.textSecondary },
  statusLabel: { fontSize: 28, lineHeight: 34, fontWeight: '900', letterSpacing: -0.5 },
  daysText: { fontSize: 15, lineHeight: 21, fontWeight: '900' },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: '#C3C6D6' },
  sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  rowLabel: { fontSize: 13, lineHeight: 18, color: Colors.textSecondary, fontWeight: '800' },
  rowValue: { flex: 1, textAlign: 'right', fontSize: 14, lineHeight: 20, color: Colors.text, fontWeight: '900' },
  rowValueHighlight: { color: Colors.warning, fontWeight: '900' },
  warningCard: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', backgroundColor: Colors.warningLight, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, borderColor: '#FDE68A' },
  warningText: { fontSize: 14, lineHeight: 20, color: '#92400E', flex: 1, fontWeight: '700' },
  emptyText: { fontSize: 14, lineHeight: 20, color: Colors.textSecondary, marginTop: Spacing.md, fontWeight: '700' },
});
