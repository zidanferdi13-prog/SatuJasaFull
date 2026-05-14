import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCustomer } from '../../modules/customers/hooks/useCustomers';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '../../theme';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: customer, isLoading } = useCustomer(id);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.center}>
        <Text>Pelanggan tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.profileCard, Shadow.sm]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{customer.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.phone}>{customer.phone}</Text>
      </View>

      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Informasi Kontak</Text>
        <InfoRow label="Nomor HP" value={customer.phone} />
        {customer.email && <InfoRow label="Email" value={customer.email} />}
        {customer.address && <InfoRow label="Alamat" value={customer.address} />}
        <InfoRow
          label="Terdaftar"
          value={new Date(customer.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}
        />
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
          onPress={() => router.push(`/customers/${id}/edit` as `/${string}`)}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Edit</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: Colors.info }]}
          onPress={() => router.push({
            pathname: '/transactions/create',
            params: { customerId: id },
          })}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Transaksi Baru</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  profileCard: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: Colors.primary },
  name: { ...Typography.h3, color: Colors.text },
  phone: { ...Typography.body, color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
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
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    margin: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    gap: Spacing.xs,
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
