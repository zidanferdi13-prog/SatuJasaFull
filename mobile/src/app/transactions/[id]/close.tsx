import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useTransaction,
  useCloseTransaction,
  useAddPayment,
} from '../../../modules/transactions/hooks/useTransactions';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '../../../theme';
import { getErrorMessage } from '../../../shared/services/api-error';

export default function CloseTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: transaction, isLoading } = useTransaction(id);
  const closeMutation = useCloseTransaction(id);
  const addPaymentMutation = useAddPayment(id);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'QRIS'>('CASH');
  const [paymentAdded, setPaymentAdded] = useState(false);

  if (isLoading || !transaction) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  const remaining = transaction.remainingAmount || 0;

  const handleAddPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Masukkan jumlah pembayaran yang valid');
      return;
    }
    try {
      await addPaymentMutation.mutateAsync({
        type: 'FINAL_PAYMENT',
        amount,
        method: paymentMethod,
      });
      setPaymentAdded(true);
      Alert.alert('Berhasil', 'Pembayaran berhasil ditambahkan');
    } catch (err) {
      Alert.alert('Gagal', getErrorMessage(err));
    }
  };

  const handleClose = async () => {
    Alert.alert('Konfirmasi', 'Tutup transaksi ini? Tindakan tidak dapat dibatalkan.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Tutup Transaksi',
        style: 'destructive',
        onPress: async () => {
          try {
            await closeMutation.mutateAsync();
            router.back();
          } catch (err) {
            Alert.alert('Gagal', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  const paymentMethods: Array<'CASH' | 'TRANSFER' | 'QRIS'> = ['CASH', 'TRANSFER', 'QRIS'];
  const methodLabels = { CASH: 'Tunai', TRANSFER: 'Transfer', QRIS: 'QRIS' };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Status Pembayaran</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Total Final</Text>
          <Text style={styles.rowValue}>Rp {(transaction.finalTotal || transaction.estimatedTotal || 0).toLocaleString('id-ID')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>DP Dibayar</Text>
          <Text style={styles.rowValue}>Rp {(transaction.dpAmount || 0).toLocaleString('id-ID')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, remaining > 0 && { color: Colors.danger }]}>Sisa Bayar</Text>
          <Text style={[styles.rowValue, remaining > 0 && { color: Colors.danger }]}>
            Rp {remaining.toLocaleString('id-ID')}
          </Text>
        </View>
      </View>

      {remaining > 0 && !paymentAdded && (
        <View style={[styles.card, Shadow.sm]}>
          <Text style={styles.sectionTitle}>Tambah Pembayaran Final</Text>

          <Text style={styles.label}>Jumlah Pembayaran</Text>
          <TextInput
            style={styles.input}
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            placeholder={String(remaining)}
            keyboardType="numeric"
          />

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Metode Pembayaran</Text>
          <View style={styles.methodRow}>
            {paymentMethods.map((m) => (
              <Pressable
                key={m}
                style={[styles.methodBtn, paymentMethod === m && styles.methodBtnActive]}
                onPress={() => setPaymentMethod(m)}
              >
                <Text style={[styles.methodBtnText, paymentMethod === m && styles.methodBtnTextActive]}>
                  {methodLabels[m]}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.addPaymentBtn, addPaymentMutation.isPending && styles.btnDisabled]}
            onPress={handleAddPayment}
            disabled={addPaymentMutation.isPending}
          >
            {addPaymentMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Tambah Pembayaran</Text>
            )}
          </Pressable>
        </View>
      )}

      <View style={[styles.infoBox]}>
        <Text style={styles.infoText}>
          {remaining <= 0
            ? 'Semua pembayaran lunas. Transaksi siap ditutup.'
            : paymentAdded
            ? 'Pembayaran ditambahkan. Transaksi siap ditutup.'
            : 'Tambahkan pembayaran sisa sebelum menutup transaksi.'}
        </Text>
      </View>

      <Pressable
        style={[
          styles.closeBtn,
          (closeMutation.isPending || (remaining > 0 && !paymentAdded)) && styles.btnDisabled,
        ]}
        onPress={handleClose}
        disabled={closeMutation.isPending || (remaining > 0 && !paymentAdded)}
      >
        {closeMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Tutup Transaksi</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md, gap: Spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md },
  sectionTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowLabel: { ...Typography.body, color: Colors.textSecondary },
  rowValue: { ...Typography.body, fontWeight: '700', color: Colors.text },
  label: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  methodRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  methodBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  methodBtnText: { ...Typography.body, color: Colors.textSecondary },
  methodBtnTextActive: { color: Colors.primary, fontWeight: '700' },
  addPaymentBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  infoBox: {
    backgroundColor: Colors.info + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  infoText: { ...Typography.body, color: Colors.info, textAlign: 'center' },
  closeBtn: {
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
