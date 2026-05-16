import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTransaction, useTransactionPayments } from '../../../modules/transactions/hooks/useTransactions';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_TRANSITION,
  TRACKING_URL,
  PAYMENT_TYPE_LABELS,
} from '../../../shared/constants';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '../../../theme';
import { Payment, TransactionItem } from '../../../shared/types';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ItemRow({ item }: { item: TransactionItem }) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemRow}>
        <Ionicons name="car-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.itemPlate}>{item.vehicle?.plateNumber || '-'}</Text>
        <Text style={styles.itemService}>{item.serviceType?.name || '-'}</Text>
      </View>
      <View style={styles.itemRow}>
        <Text style={styles.itemLabel}>Estimasi</Text>
        <Text style={styles.itemPrice}>Rp {(item.estimatedPrice || 0).toLocaleString('id-ID')}</Text>
        {item.finalPrice !== undefined && (
          <>
            <Text style={styles.itemLabel}>Final</Text>
            <Text style={styles.itemPrice}>Rp {(item.finalPrice || 0).toLocaleString('id-ID')}</Text>
          </>
        )}
      </View>
    </View>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  return (
    <View style={styles.paymentItem}>
      <View>
        <Text style={styles.paymentType}>{PAYMENT_TYPE_LABELS[payment.type] || payment.type}</Text>
        <Text style={styles.paymentDate}>
          {new Date(payment.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </Text>
      </View>
      <Text style={[styles.paymentAmount, payment.type === 'REFUND' && styles.refundAmount]}>
        {payment.type === 'REFUND' ? '-' : '+'}Rp {payment.amount.toLocaleString('id-ID')}
      </Text>
    </View>
  );
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: transaction, isLoading } = useTransaction(id);
  const { data: payments } = useTransactionPayments(id);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }
  if (!transaction) {
    return <View style={styles.center}><Text>Transaksi tidak ditemukan</Text></View>;
  }

  const statusColor = STATUS_COLORS[transaction.status] || Colors.textLight;
  const nextStatus = STATUS_TRANSITION[transaction.status];
  const canFinalize = transaction.status === 'READY_TO_PICKUP' || transaction.status === 'COMPLETED';
  const canClose = transaction.status === 'COMPLETED';

  const handleShareTracking = async () => {
    const link = `${TRACKING_URL}/${transaction.trackingCode}`;
    await Share.share({
      message: `Lacak STNK kendaraan Anda:\n${link}\n\nKode: ${transaction.trackingCode}`,
      url: link,
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Status Header */}
      <View style={[styles.statusHeader, { backgroundColor: statusColor + '15' }]}>
        <View style={styles.statusRow}>
          <Text style={styles.invoiceNum}>{transaction.invoiceNumber}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor + '30' }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {STATUS_LABELS[transaction.status]}
            </Text>
          </View>
        </View>
        <Text style={styles.customerName}>{transaction.customer?.name || '-'}</Text>
      </View>

      {/* Transaction Info */}
      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Informasi Transaksi</Text>
        <InfoRow label="Invoice" value={transaction.invoiceNumber} />
        <InfoRow label="Tracking" value={transaction.trackingCode} />
        <InfoRow label="Cabang" value={transaction.branch?.name || '-'} />
        {transaction.estimatedFinishDate && (
          <InfoRow
            label="Est. Selesai"
            value={new Date(transaction.estimatedFinishDate).toLocaleDateString('id-ID', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          />
        )}
        <InfoRow label="Dibuat" value={new Date(transaction.createdAt).toLocaleDateString('id-ID', {
          day: '2-digit', month: 'short', year: 'numeric',
        })} />
      </View>

      {/* Financial Summary */}
      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
        <InfoRow label="Estimasi Total" value={`Rp ${(transaction.estimatedTotal || 0).toLocaleString('id-ID')}`} />
        {transaction.finalTotal !== undefined && transaction.finalTotal !== null && (
          <InfoRow label="Total Final" value={`Rp ${(transaction.finalTotal || 0).toLocaleString('id-ID')}`} />
        )}
        <InfoRow label="DP" value={`Rp ${(transaction.dpAmount || 0).toLocaleString('id-ID')}`} />
        {transaction.remainingAmount !== undefined && transaction.remainingAmount !== null && (
          <InfoRow label="Sisa Bayar" value={`Rp ${(transaction.remainingAmount || 0).toLocaleString('id-ID')}`} />
        )}
        {transaction.refundAmount !== undefined && transaction.refundAmount !== null && transaction.refundAmount > 0 && (
          <InfoRow label="Refund" value={`Rp ${(transaction.refundAmount || 0).toLocaleString('id-ID')}`} />
        )}
      </View>

      {/* Items */}
      {transaction.items && transaction.items.length > 0 && (
        <View style={[styles.card, Shadow.sm]}>
          <Text style={styles.sectionTitle}>Kendaraan ({transaction.items.length})</Text>
          {transaction.items.map((item) => <ItemRow key={item.id} item={item} />)}
        </View>
      )}

      {/* Payments */}
      {payments && payments.length > 0 && (
        <View style={[styles.card, Shadow.sm]}>
          <Text style={styles.sectionTitle}>Riwayat Pembayaran</Text>
          {payments.map((p) => <PaymentRow key={p.id} payment={p} />)}
        </View>
      )}

      {/* Status Timeline */}
      {transaction.logs && transaction.logs.length > 0 && (
        <View style={[styles.card, Shadow.sm]}>
          <Text style={styles.sectionTitle}>Riwayat Status</Text>
          {transaction.logs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logDot} />
              <View style={styles.logContent}>
                <Text style={styles.logStatus}>{STATUS_LABELS[log.toStatus] || log.toStatus}</Text>
                {log.notes && <Text style={styles.logNotes}>{log.notes}</Text>}
                <Text style={styles.logDate}>
                  {new Date(log.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSection}>
        <Pressable style={styles.shareBtn} onPress={handleShareTracking}>
          <Ionicons name="share-social-outline" size={18} color={Colors.primary} />
          <Text style={styles.shareBtnText}>Bagikan Tracking</Text>
        </Pressable>

        {nextStatus && transaction.status !== 'COMPLETED' && transaction.status !== 'CLOSED' && (
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push(`/transactions/${id}/status` as `/${string}`)}
          >
            <Ionicons name="arrow-forward-circle-outline" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>
              Update ke {STATUS_LABELS[nextStatus as keyof typeof STATUS_LABELS]}
            </Text>
          </Pressable>
        )}

        {canFinalize && (
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: Colors.warning }]}
            onPress={() => router.push(`/transactions/${id}/finalize` as `/${string}`)}
          >
            <Ionicons name="calculator-outline" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Finalisasi Harga</Text>
          </Pressable>
        )}

        {canClose && (
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: Colors.success }]}
            onPress={() => router.push(`/transactions/${id}/close` as `/${string}`)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Tutup Transaksi</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusHeader: {
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invoiceNum: { ...Typography.h3, color: Colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  badgeText: { fontSize: 12, fontWeight: '700' },
  customerName: { ...Typography.body, color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.surface,
    margin: Spacing.sm,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  sectionTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowLabel: { ...Typography.body, color: Colors.textSecondary },
  rowValue: { ...Typography.body, color: Colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },
  itemCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
    gap: 4,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  itemPlate: { ...Typography.body, fontWeight: '700', color: Colors.text },
  itemService: { ...Typography.bodySmall, color: Colors.textSecondary, flex: 1 },
  itemLabel: { ...Typography.caption, color: Colors.textSecondary },
  itemPrice: { ...Typography.bodySmall, color: Colors.text, fontWeight: '600', marginRight: Spacing.sm },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  paymentType: { ...Typography.body, fontWeight: '600', color: Colors.text },
  paymentDate: { ...Typography.caption, color: Colors.textLight },
  paymentAmount: { ...Typography.body, fontWeight: '700', color: Colors.success },
  refundAmount: { color: Colors.danger },
  logItem: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  logDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.primary, marginTop: 5,
  },
  logContent: { flex: 1 },
  logStatus: { ...Typography.body, fontWeight: '600', color: Colors.text },
  logNotes: { ...Typography.bodySmall, color: Colors.textSecondary },
  logDate: { ...Typography.caption, color: Colors.textLight },
  actionsSection: {
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  shareBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    gap: Spacing.sm,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
