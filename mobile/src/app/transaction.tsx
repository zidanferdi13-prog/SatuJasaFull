import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { transactionAPI } from '../api/transactions';

export default function TransactionScreen() {
  const [form, setForm] = useState({
    customerId: '', vehicleId: '', serviceId: '', price: '', dpAmount: '', estimatedFinishDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.customerId || !form.vehicleId || !form.price) {
      Alert.alert('Error', 'Customer, Vehicle, and Price are required');
      return;
    }
    setLoading(true);
    try {
      const result = await transactionAPI.create({
        customerId: form.customerId,
        dpAmount: Number(form.dpAmount) || 0,
        estimatedFinishDate: form.estimatedFinishDate || undefined,
        items: [{ vehicleId: form.vehicleId, serviceId: form.serviceId || 'default', price: Number(form.price) }],
      });
      Alert.alert('Success', `Created: ${result.invoiceNumber}`);
      setForm({ customerId: '', vehicleId: '', serviceId: '', price: '', dpAmount: '', estimatedFinishDate: '' });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>New Transaction</Text>
      <Text style={styles.label}>Customer ID</Text>
      <TextInput style={styles.input} placeholder="Customer UUID" value={form.customerId} onChangeText={(t) => setForm({ ...form, customerId: t })} />
      <Text style={styles.label}>Vehicle ID</Text>
      <TextInput style={styles.input} placeholder="Vehicle UUID" value={form.vehicleId} onChangeText={(t) => setForm({ ...form, vehicleId: t })} />
      <Text style={styles.label}>Service ID</Text>
      <TextInput style={styles.input} placeholder="Service UUID" value={form.serviceId} onChangeText={(t) => setForm({ ...form, serviceId: t })} />
      <Text style={styles.label}>Price (Rp)</Text>
      <TextInput style={styles.input} placeholder="500000" keyboardType="numeric" value={form.price} onChangeText={(t) => setForm({ ...form, price: t })} />
      <Text style={styles.label}>DP Amount (Rp)</Text>
      <TextInput style={styles.input} placeholder="100000" keyboardType="numeric" value={form.dpAmount} onChangeText={(t) => setForm({ ...form, dpAmount: t })} />
      <Text style={styles.label}>Est. Finish Date</Text>
      <TextInput style={styles.input} placeholder="2026-06-01" value={form.estimatedFinishDate} onChangeText={(t) => setForm({ ...form, estimatedFinishDate: t })} />
      <Pressable style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Transaction'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, color: '#333' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#555' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, fontSize: 14, backgroundColor: '#fff' },
  button: { backgroundColor: '#007AFF', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
