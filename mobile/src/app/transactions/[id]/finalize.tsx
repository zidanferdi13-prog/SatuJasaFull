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
import { useTransaction, useFinalizeTransaction } from '../../../modules/transactions/hooks/useTransactions';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '../../../theme';
import { getErrorMessage } from '../../../shared/services/api-error';

export default function FinalizeTransactionScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = String(params.id ?? '');
  const router = useRouter();
  const { data: transaction, isLoading } = useTransaction(id);
  const finalizeMutation = useFinalizeTransaction(id);
  const [finalPrices, setFinalPrices] = useState<Record<string, string>>({});

  if (isLoading || !transaction) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  const handleFinalize = async () => {
    const items = (transaction.items || []).map((item) => ({
      id: item.id,
      finalPrice: parseFloat(finalPrices[item.id] || '0') || item.estimatedPrice || 0,
    }));

    const finalTotal = items.reduce((sum, item) => sum + item.finalPrice, 0);
    const estimatedTotal = transaction.estimatedTotal || 0;
    const refund = estimatedTotal - finalTotal;

    const confirmMsg = refund > 0
      ? `Total final Rp ${finalTotal.toLocaleString('id-ID')}.\nAkan ada refund Rp ${refund.toLocaleString('id-ID')}.`
      : `Total final Rp ${finalTotal.toLocaleString('id-ID')}.`;

    Alert.alert('Konfirmasi', confirmMsg, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Finalisasi',
        style: 'default',
        onPress: async () => {
          try {
            // API only accepts { finalTotal, notes } — per-item prices are UI-only
            await finalizeMutation.mutateAsync({ finalTotal });
            router.back();
          } catch (err) {
            Alert.alert('Gagal', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  const calcFinalTotal = (transaction.items || []).reduce((sum, item) => {
    const price = parseFloat(finalPrices[item.id] || '0') || item.estimatedPrice || 0;
    return sum + price;
  }, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Estimasi Total</Text>
        <Text style={styles.totalText}>
          Rp {(transaction.estimatedTotal || 0).toLocaleString('id-ID')}
        </Text>
      </View>

      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Harga Final Per Kendaraan</Text>
        {(transaction.items || []).map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemPlate}>{item.vehicle?.plateNumber || '-'}</Text>
              <Text style={styles.itemService}>{item.serviceType?.name || '-'}</Text>
              <Text style={styles.itemEstimate}>Est: Rp {(item.estimatedPrice || 0).toLocaleString('id-ID')}</Text>
            </View>
            <TextInput
              style={styles.priceInput}
              value={finalPrices[item.id] || ''}
              onChangeText={(v) => setFinalPrices({ ...finalPrices, [item.id]: v })}
              placeholder={String(item.estimatedPrice || 0)}
              keyboardType="numeric"
            />
          </View>
        ))}
      </View>

      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Ringkasan</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Final</Text>
          <Text style={styles.summaryValue}>Rp {calcFinalTotal.toLocaleString('id-ID')}</Text>
        </View>
        {calcFinalTotal < (transaction.estimatedTotal || 0) && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: Colors.danger }]}>Refund</Text>
            <Text style={[styles.summaryValue, { color: Colors.danger }]}>
              Rp {((transaction.estimatedTotal || 0) - calcFinalTotal).toLocaleString('id-ID')}
            </Text>
          </View>
        )}
      </View>

      <Pressable
        style={[styles.submitBtn, finalizeMutation.isPending && styles.btnDisabled]}
        onPress={handleFinalize}
        disabled={finalizeMutation.isPending}
      >
        {finalizeMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Finalisasi Transaksi</Text>
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
  totalText: { ...Typography.h2, color: Colors.text },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemInfo: { flex: 1 },
  itemPlate: { ...Typography.body, fontWeight: '700', color: Colors.text },
  itemService: { ...Typography.bodySmall, color: Colors.textSecondary },
  itemEstimate: { ...Typography.caption, color: Colors.textLight },
  priceInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    width: 120,
    textAlign: 'right',
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  summaryLabel: { ...Typography.body, color: Colors.textSecondary },
  summaryValue: { ...Typography.body, fontWeight: '700', color: Colors.text },
  submitBtn: {
    backgroundColor: Colors.warning,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
