import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVehicle } from '../../../modules/vehicles/hooks/useVehicles';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '../../../theme';

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function VehicleDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = String(params.id ?? '');
  const router = useRouter();
  const { data: vehicle, isLoading } = useVehicle(id);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }
  if (!vehicle) {
    return <View style={styles.center}><Text>Kendaraan tidak ditemukan</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.plateCard, Shadow.sm]}>
        <View style={styles.plateBox}>
          <Text style={styles.plateText}>{vehicle.plateNumber}</Text>
        </View>
        <Text style={styles.vehicleName}>
          {[vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Kendaraan'}
        </Text>
        {vehicle.registrationYear && (
          <Text style={styles.year}>Tahun {vehicle.registrationYear}</Text>
        )}
      </View>

      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Detail Kendaraan</Text>
        <InfoRow label="Nomor Plat" value={vehicle.plateNumber} />
        <InfoRow label="Merek" value={vehicle.brand} />
        <InfoRow label="Model" value={vehicle.model} />
        <InfoRow label="Tahun" value={vehicle.registrationYear?.toString()} />
        <InfoRow label="Nomor Mesin" value={vehicle.engineNumber} />
        <InfoRow label="Nomor Rangka" value={vehicle.chassisNumber} />
      </View>

      {vehicle.customer && (
        <View style={[styles.card, Shadow.sm]}>
          <Text style={styles.sectionTitle}>Pemilik</Text>
          <InfoRow label="Nama" value={vehicle.customer.name} />
          <InfoRow label="Nomor HP" value={vehicle.customer.phone} />
        </View>
      )}

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
          onPress={() => router.push(`/vehicles/${id}/edit` as `/${string}`)}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Edit</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: Colors.info }]}
          onPress={() => router.push({
            pathname: '/transactions/create',
            params: { vehicleId: id },
          })}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Transaksi Baru</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  plateCard: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  plateBox: {
    backgroundColor: Colors.text,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  plateText: { color: '#fff', fontWeight: '800', fontSize: 22, letterSpacing: 2 },
  vehicleName: { ...Typography.h3, color: Colors.text },
  year: { ...Typography.body, color: Colors.textSecondary },
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
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, margin: Spacing.md },
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
