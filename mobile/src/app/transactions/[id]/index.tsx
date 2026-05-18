import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTransaction, useTransactionPayments, useUpdateDocumentChecklist } from '../../../modules/transactions/hooks/useTransactions';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_TRANSITION,
  TRACKING_URL,
  PAYMENT_TYPE_LABELS,
} from '../../../shared/constants';
import { Colors, Spacing, Shadow, BorderRadius } from '../../../theme';
import { Payment, TransactionItem } from '../../../shared/types';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ItemRow({ item, onToggleDocument, disabled }: {
  item: TransactionItem;
  onToggleDocument: (checklistId: string, isChecked: boolean) => void;
  disabled: boolean;
}) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemRow}>
        <View style={styles.itemIconBox}>
          <Ionicons name="car-outline" size={18} color={Colors.primaryDark} />
        </View>
        <View style={styles.itemMainInfo}>
          <Text style={styles.itemPlate}>{item.vehicle?.plateNumber || '-'}</Text>
          <Text style={styles.itemService}>{item.serviceType?.name || '-'}</Text>
        </View>
      </View>
      <View style={styles.itemRow}>
        <Text style={styles.itemLabel}>Estimasi</Text>
        <Text style={styles.itemPrice}>Rp {(item.price || item.estimatedPrice || 0).toLocaleString('id-ID')}</Text>
        {item.finalPrice !== undefined && (
          <>
            <Text style={styles.itemLabel}>Final</Text>
            <Text style={styles.itemPrice}>Rp {(item.finalPrice || 0).toLocaleString('id-ID')}</Text>
          </>
        )}
      </View>
      {!!item.feeDetails?.length && (
        <View style={styles.detailBox}>
          <Text style={styles.detailTitle}>Rincian Biaya</Text>
          {item.feeDetails.map((fee) => (
            <View key={fee.id} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{fee.componentName}</Text>
              <Text style={styles.detailValue}>Rp {Number(fee.amount || 0).toLocaleString('id-ID')}</Text>
            </View>
          ))}
        </View>
      )}
      {!!item.documentChecklist?.length && (
        <View style={styles.detailBox}>
          <Text style={styles.detailTitle}>Checklist Dokumen</Text>
          {item.documentChecklist.map((doc) => (
            <Pressable
              key={doc.id}
              style={styles.checklistRow}
              onPress={() => onToggleDocument(doc.id, !doc.isChecked)}
              disabled={disabled}
            >
              <Ionicons name={doc.isChecked ? 'checkbox' : 'square-outline'} size={20} color={doc.isChecked ? Colors.success : Colors.textSecondary} />
              <Text style={[styles.detailLabel, doc.isChecked && styles.checklistCheckedLabel]}>{doc.documentName}</Text>
            </Pressable>
          ))}
        </View>
      )}
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

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatWhatsAppPhone(phone?: string) {
  const digits = phone?.replace(/\D/g, '') || '';
  if (!digits) return '';
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  return digits;
}

export default function TransactionDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = String(params.id ?? '');
  const router = useRouter();
  const { data: transaction, isLoading } = useTransaction(id);
  const { data: payments } = useTransactionPayments(id);
  const updateChecklistMutation = useUpdateDocumentChecklist(id);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primaryDark} /></View>;
  }
  if (!transaction) {
    return <View style={styles.center}><Text>Transaksi tidak ditemukan</Text></View>;
  }

  const statusColor = STATUS_COLORS[transaction.status] || Colors.textLight;
  const nextStatus = STATUS_TRANSITION[transaction.status];
  const canFinalize = transaction.status === 'READY_TO_PICKUP' || transaction.status === 'COMPLETED';
  const canClose = transaction.status === 'COMPLETED';

  const handleToggleDocument = (checklistId: string, isChecked: boolean) => {
    updateChecklistMutation.mutate({
      checklistId,
      payload: { isChecked },
    }, {
      onError: (error) => Alert.alert('Gagal update checklist', String(error)),
    });
  };

  const handleShareTracking = async () => {
    const phone = formatWhatsAppPhone(transaction.customer?.phone);
    if (!phone) {
      Alert.alert('Nomor WhatsApp tidak tersedia', 'Nomor HP pelanggan belum tersedia di data transaksi.');
      return;
    }

    const link = `${TRACKING_URL}/${transaction.trackingCode}`;
    const items = transaction.items?.map((item, index) => {
      const vehicle = item.vehicle?.plateNumber || '-';
      const service = item.serviceType?.name || '-';
      const amount = item.finalPrice ?? item.price ?? item.estimatedPrice ?? 0;
      return `${index + 1}. ${vehicle} - ${service}: ${formatRupiah(amount)}`;
    }).join('\n') || '-';
    const total = transaction.finalTotal ?? transaction.estimatedTotal ?? 0;
    const remaining = transaction.remainingAmount ?? 0;
    const estimatedFinish = transaction.estimatedFinishDate
      ? new Date(transaction.estimatedFinishDate).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
      : '-';
    const message = [
      `Halo ${transaction.customer?.name || 'Bapak/Ibu'}, berikut invoice transaksi STNK Anda.`,
      '',
      `Invoice: ${transaction.invoiceNumber}`,
      `Kode Tracking: ${transaction.trackingCode}`,
      `Status: ${STATUS_LABELS[transaction.status]}`,
      `Estimasi Selesai: ${estimatedFinish}`,
      '',
      'Rincian:',
      items,
      '',
      `Total Tagihan: ${formatRupiah(total)}`,
      `DP: ${formatRupiah(transaction.dpAmount || 0)}`,
      `Sisa Bayar: ${formatRupiah(remaining)}`,
      '',
      `Link tracking: ${link}`,
    ].join('\n');
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    const fallbackUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      await Linking.openURL(canOpen ? url : fallbackUrl);
    } catch {
      Alert.alert('Gagal membuka WhatsApp', 'Pastikan WhatsApp sudah terpasang di perangkat.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Header */}
      <View style={[styles.statusHeader, Shadow.sm, { backgroundColor: statusColor + '12' }]}>
        <View style={styles.statusRow}>
          <Text style={styles.invoiceNum}>{transaction.invoiceNumber}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor + '16', borderColor: statusColor + '55' }]} >
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {STATUS_LABELS[transaction.status]}
            </Text>
          </View>
        </View>
        <Text style={styles.customerName}>{transaction.customer?.name || '-'}</Text>
        <Text style={styles.trackingHint}>Tracking {transaction.trackingCode}</Text>
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
          {transaction.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggleDocument={handleToggleDocument}
              disabled={updateChecklistMutation.isPending}
            />
          ))}
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
  content: { padding: Spacing.lg, paddingTop: Spacing['2xl'], paddingBottom: 96, gap: Spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  statusHeader: { padding: Spacing.xl, gap: Spacing.xs, borderWidth: 1, borderColor: '#C3C6D6', borderRadius: BorderRadius.xl },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.md },
  invoiceNum: { flex: 1, fontSize: 26, lineHeight: 32, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  badge: { borderWidth: 1, paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  customerName: { fontSize: 16, lineHeight: 22, color: Colors.text, fontWeight: '800', marginTop: Spacing.sm },
  trackingHint: { fontSize: 12, lineHeight: 17, color: Colors.textSecondary, fontWeight: '900', letterSpacing: 0.7, textTransform: 'uppercase' },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.xs, borderWidth: 1, borderColor: '#C3C6D6' },
  sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  rowLabel: { fontSize: 13, lineHeight: 18, color: Colors.textSecondary, fontWeight: '800' },
  rowValue: { fontSize: 14, lineHeight: 20, color: Colors.text, fontWeight: '800', flex: 1, textAlign: 'right' },
  itemCard: { backgroundColor: Colors.surfaceMuted, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.divider },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  itemIconBox: { width: 42, height: 42, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  itemMainInfo: { flex: 1 },
  itemPlate: { fontSize: 17, lineHeight: 23, fontWeight: '900', color: Colors.text },
  itemService: { fontSize: 13, lineHeight: 18, color: Colors.textSecondary, fontWeight: '700' },
  itemLabel: { fontSize: 11, lineHeight: 15, color: Colors.textSecondary, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  itemPrice: { fontSize: 13, lineHeight: 18, color: Colors.text, fontWeight: '900', marginRight: Spacing.sm },
  detailBox: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.sm, gap: 6 },
  detailTitle: { fontSize: 12, lineHeight: 16, color: Colors.text, fontWeight: '900' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  detailLabel: { fontSize: 12, lineHeight: 17, color: Colors.textSecondary, flex: 1 },
  detailValue: { fontSize: 12, lineHeight: 17, color: Colors.text, fontWeight: '800' },
  checklistRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingVertical: 6 },
  checklistCheckedLabel: { color: Colors.text, fontWeight: '800' },
  paymentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  paymentType: { fontSize: 15, lineHeight: 21, fontWeight: '900', color: Colors.text },
  paymentDate: { fontSize: 11, lineHeight: 15, color: Colors.textLight, fontWeight: '700', marginTop: 2 },
  paymentAmount: { fontSize: 15, lineHeight: 21, fontWeight: '900', color: Colors.success },
  refundAmount: { color: Colors.danger },
  logItem: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  logDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primaryDark, marginTop: 5, borderWidth: 3, borderColor: Colors.primaryLight },
  logContent: { flex: 1 },
  logStatus: { fontSize: 15, lineHeight: 21, fontWeight: '900', color: Colors.text },
  logNotes: { fontSize: 13, lineHeight: 18, color: Colors.textSecondary, marginTop: 2 },
  logDate: { fontSize: 11, lineHeight: 15, color: Colors.textLight, fontWeight: '700', marginTop: 2 },
  actionsSection: { gap: Spacing.sm },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.primaryDark, borderRadius: BorderRadius.lg, paddingVertical: 14, gap: Spacing.sm, backgroundColor: Colors.primaryLight },
  shareBtnText: { color: Colors.primaryDark, fontWeight: '900', fontSize: 15 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryDark, borderRadius: BorderRadius.lg, paddingVertical: 15, gap: Spacing.sm },
  primaryBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
