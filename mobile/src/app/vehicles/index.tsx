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
import { Colors, Spacing, Shadow, BorderRadius } from '../../theme';

function VehicleCard({ item, onPress }: { item: Vehicle; onPress: () => void }) {
  return (
    <Pressable style={[styles.card, Shadow.sm]} onPress={onPress}>
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
      <View style={styles.searchSection}>
        <Text style={styles.eyebrow}>Vehicle Vault</Text>
        <Text style={styles.pageTitle}>Kendaraan</Text>
        <Text style={styles.pageSubtitle}>Kelola plat, pemilik, dan data fisik kendaraan pelanggan.</Text>
        <View style={[styles.searchBox, Shadow.sm]}>
          <Ionicons name="search-outline" size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nomor plat kendaraan..."
            placeholderTextColor={Colors.textLight}
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
            <View style={styles.emptyCard}>
              <Ionicons name="car-outline" size={42} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>Belum ada kendaraan</Text>
              <Text style={styles.emptyText}>Tambahkan kendaraan agar transaksi baru lebih cepat dibuat.</Text>
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
  searchSection: { paddingHorizontal: Spacing.lg, paddingTop: Spacing['2xl'], paddingBottom: Spacing.sm },
  eyebrow: { fontSize: 12, fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.primaryDark, marginBottom: 4 },
  pageTitle: { fontSize: 32, lineHeight: 38, fontWeight: '900', color: Colors.text, letterSpacing: -0.8 },
  pageSubtitle: { fontSize: 14, lineHeight: 20, color: Colors.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.lg },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: 12, gap: Spacing.sm, borderWidth: 1, borderColor: '#C3C6D6' },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text, paddingVertical: 0 },
  listContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 96, gap: Spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, borderColor: '#C3C6D6' },
  plateBox: { backgroundColor: Colors.text, paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.sm, minWidth: 96, alignItems: 'center', borderWidth: 2, borderColor: '#26324A' },
  plateText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1.1 },
  info: { flex: 1, minWidth: 0 },
  vehicleName: { fontSize: 17, lineHeight: 23, fontWeight: '900', color: Colors.text },
  year: { fontSize: 13, lineHeight: 18, color: Colors.textSecondary, fontWeight: '700', marginTop: 2 },
  owner: { fontSize: 12, lineHeight: 16, color: Colors.primaryDark, fontWeight: '900', marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'] },
  emptyCard: { alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'], backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: '#C3C6D6' },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: Colors.text, marginTop: Spacing.md },
  emptyText: { fontSize: 14, lineHeight: 20, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' },
  fab: { position: 'absolute', bottom: Spacing.xl, right: Spacing.xl, width: 58, height: 58, borderRadius: BorderRadius.lg, backgroundColor: Colors.primaryDark, alignItems: 'center', justifyContent: 'center', ...Shadow.md },
});
