import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '@/modules/settings/hooks/useSettings';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '@/theme';

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>{value}</Text>
    </View>
  );
}

export default function SubscriptionScreen() {
  const { data: subscription, isLoading } = useSubscription();

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (!subscription) {
    return (
      <View style={styles.center}>
        <Ionicons name="card-outline" size={48} color={Colors.textLight} />
        <Text style={styles.emptyText}>Tidak ada data langganan</Text>
      </View>
    );
  }

  const endDate = new Date(subscription.subscriptionEnd);
  const now = new Date();
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiring = daysRemaining <= 7;
  const isExpired = daysRemaining <= 0;

  const statusColor = isExpired ? Colors.danger : isExpiring ? Colors.warning : Colors.success;
  const isActive = subscription.subscriptionStatus === 'ACTIVE';
  const statusLabel = isExpired ? 'Kedaluwarsa' : isActive ? 'Aktif' : 'Tidak Aktif';

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.statusCard, { backgroundColor: statusColor + '15' }, Shadow.sm]}>
        <Ionicons
          name={isExpired ? 'close-circle' : isExpiring ? 'warning' : 'checkmark-circle'}
          size={40}
          color={statusColor}
        />
        <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
        {!isExpired && (
          <Text style={[styles.daysText, { color: statusColor }]}>
            {daysRemaining} hari tersisa
          </Text>
        )}
      </View>

      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Detail Langganan</Text>
        <InfoRow label="Paket" value="Standard" />
        <InfoRow
          label="Tanggal Mulai"
          value={new Date(subscription.subscriptionStart).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}
        />
        <InfoRow
          label="Tanggal Berakhir"
          value={endDate.toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}
          highlight={isExpiring}
        />
        <InfoRow label="Sisa Hari" value={`${Math.max(0, daysRemaining)} hari`} highlight={isExpiring} />
      </View>

      {(isExpiring || isExpired) && (
        <View style={[styles.warningCard]}>
          <Ionicons name="warning-outline" size={20} color={Colors.warning} />
          <Text style={styles.warningText}>
            {isExpired
              ? 'Langganan Anda telah berakhir. Hubungi admin untuk perpanjangan.'
              : `Langganan Anda akan berakhir dalam ${daysRemaining} hari. Segera perpanjang untuk menghindari gangguan layanan.`}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'] },
  statusCard: {
    margin: Spacing.md, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm,
  },
  statusLabel: { ...Typography.h2 },
  daysText: { ...Typography.body, fontWeight: '600' },
  card: {
    backgroundColor: Colors.surface, margin: Spacing.md,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
  },
  sectionTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.sm },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  rowLabel: { ...Typography.body, color: Colors.textSecondary },
  rowValue: { ...Typography.body, color: Colors.text, fontWeight: '500' },
  rowValueHighlight: { color: Colors.warning, fontWeight: '700' },
  warningCard: {
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start',
    backgroundColor: Colors.warning + '15', borderRadius: BorderRadius.md,
    margin: Spacing.md, padding: Spacing.md,
  },
  warningText: { ...Typography.body, color: Colors.warning, flex: 1, lineHeight: 20 },
  emptyText: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.md },
});
