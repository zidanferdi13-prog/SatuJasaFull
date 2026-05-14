import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVehicles } from '../../modules/vehicles/hooks/useVehicles';
import { Vehicle } from '../../shared/types';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '../../theme';

function VehicleCard({ item, onPress }: { item: Vehicle; onPress: () => void }) {
  return (
    <Pressable style={[styles.card, Shadow.sm]} onPress={onPress}>
      <View style={styles.cardRow}>
        <View style={styles.plateBox}>
          <Text style={styles.plateText}>{item.plateNumber}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.vehicleName}>
            {[item.brand, item.model].filter(Boolean).join(' ') || 'Kendaraan'}
          </Text>
          {item.registrationYear && (
            <Text style={styles.year}>Tahun {item.registrationYear}</Text>
          )}
          {item.customer && (
            <Text style={styles.owner}>{item.customer.name}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      </View>
    </Pressable>
  );
}

export default function VehicleListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: vehicles, isLoading, refetch } = useVehicles({
    search: search.length >= 2 ? search : undefined,
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nomor plat kendaraan..."
          value={search}
          onChangeText={setSearch}
          autoCapitalize="characters"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textLight} />
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VehicleCard
              item={item}
              onPress={() => router.push(`/vehicles/${item.id}` as `/${string}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="car-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>Belum ada kendaraan</Text>
            </View>
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}

      <Pressable style={styles.fab} onPress={() => router.push('/vehicles/create')}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  listContent: { padding: Spacing.sm, paddingBottom: 80 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  plateBox: {
    backgroundColor: Colors.text,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  plateText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  info: { flex: 1 },
  vehicleName: { ...Typography.body, fontWeight: '600', color: Colors.text },
  year: { ...Typography.bodySmall, color: Colors.textSecondary },
  owner: { ...Typography.caption, color: Colors.primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'] },
  emptyText: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.md },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
});
