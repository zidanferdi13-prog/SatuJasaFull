import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useCreateTransaction } from '../../modules/transactions/hooks/useTransactions';
import { Colors, Spacing, BorderRadii, FontSizes } from '../../theme';

interface TransactionFormProps {
  onSuccess?: (result: any) => void;
  onCancel?: () => void;
}

export function TransactionForm({ onSuccess, onCancel }: TransactionFormProps) {
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [price, setPrice] = useState('');
  const [dpAmount, setDpAmount] = useState('');
  const [finishDate, setFinishDate] = useState('');

  const createMutation = useCreateTransaction();

  const handleSubmit = async () => {
    if (!customerId || !vehicleId || !price) {
      Alert.alert('Error', 'Customer, Vehicle, and Price are required');
      return;
    }

    createMutation.mutate(
      {
        customerId,
        dpAmount: Number(dpAmount) || 0,
        estimatedFinishDate: finishDate || undefined,
        items: [{ vehicleId, serviceId: serviceId || 'default', price: Number(price) }],
      },
      {
        onSuccess: (result) => {
          Alert.alert('Sukses', `Transaksi ${result.invoiceNumber} berhasil dibuat`);
          onSuccess?.(result);
        },
        onError: (err: any) => {
          Alert.alert('Gagal', err.response?.data?.error || 'Terjadi kesalahan');
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Customer</Text>
      <TextInput style={styles.input} placeholder="Customer ID" value={customerId} onChangeText={setCustomerId} />

      <Text style={styles.sectionTitle}>Kendaraan</Text>
      <TextInput style={styles.input} placeholder="Vehicle ID" value={vehicleId} onChangeText={setVehicleId} />

      <Text style={styles.sectionTitle}>Layanan</Text>
      <TextInput style={styles.input} placeholder="Service ID" value={serviceId} onChangeText={setServiceId} />

      <Text style={styles.sectionTitle}>Harga (Rp)</Text>
      <TextInput style={styles.input} placeholder="500000" keyboardType="numeric" value={price} onChangeText={setPrice} />

      <Text style={styles.sectionTitle}>DP (Rp)</Text>
      <TextInput style={styles.input} placeholder="100000" keyboardType="numeric" value={dpAmount} onChangeText={setDpAmount} />

      <Text style={styles.sectionTitle}>Estimasi Selesai</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={finishDate} onChangeText={setFinishDate} />

      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Batal</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.submitBtn, createMutation.isPending && { opacity: 0.6 }]} onPress={handleSubmit} disabled={createMutation.isPending}>
          <Text style={styles.submitText}>{createMutation.isPending ? 'Menyimpan...' : 'Buat Transaksi'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadii.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.md,
    backgroundColor: Colors.surface, marginBottom: Spacing.sm,
  },
  actions: { flexDirection: 'row', marginTop: Spacing.xl, gap: Spacing.md },
  cancelBtn: { flex: 1, padding: Spacing.lg, alignItems: 'center', borderRadius: BorderRadii.md, borderWidth: 1, borderColor: Colors.border },
  cancelText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textSecondary },
  submitBtn: { flex: 2, padding: Spacing.lg, alignItems: 'center', borderRadius: BorderRadii.md, backgroundColor: Colors.primary },
  submitText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.surface },
});