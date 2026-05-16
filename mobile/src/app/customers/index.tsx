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
import { useCustomers } from '../../modules/customers/hooks/useCustomers';
import { Customer } from '../../shared/types';
import { Colors, Spacing, Shadow, BorderRadius } from '../../theme';

function CustomerCard({ item, onPress }: { item: Customer; onPress: () => void }) {
  return (
    <Pressable style={[styles.card, Shadow.sm]} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
        {item.email && <Text style={styles.email}>{item.email}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
    </Pressable>
  );
}

export default function CustomerListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: customers, isLoading, refetch } = useCustomers(search.length >= 2 ? search : undefined);

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Text style={styles.eyebrow}>Customer Registry</Text>
        <Text style={styles.pageTitle}>Pelanggan</Text>
        <Text style={styles.pageSubtitle}>Cari data pemilik kendaraan dan riwayat layanan STNK.</Text>
        <View style={[styles.searchBox, Shadow.sm]}>
          <Ionicons name="search-outline" size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau nomor HP..."
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
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
          data={customers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CustomerCard
              item={item}
              onPress={() => router.push(`/customers/${item.id}` as `/${string}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={42} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>Belum ada pelanggan</Text>
              <Text style={styles.emptyText}>Tambahkan pelanggan pertama untuk mulai mencatat kendaraan.</Text>
            </View>
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}

      <Pressable style={styles.fab} onPress={() => router.push('/customers/create')}>
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
  avatar: { width: 52, height: 52, borderRadius: BorderRadius.lg, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '900', color: Colors.primaryDark },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 17, lineHeight: 23, fontWeight: '900', color: Colors.text },
  phone: { fontSize: 13, lineHeight: 18, color: Colors.textSecondary, fontWeight: '700', marginTop: 2 },
  email: { fontSize: 12, lineHeight: 16, color: Colors.textLight, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'] },
  emptyCard: { alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'], backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: '#C3C6D6' },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: Colors.text, marginTop: Spacing.md },
  emptyText: { fontSize: 14, lineHeight: 20, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' },
  fab: { position: 'absolute', bottom: Spacing.xl, right: Spacing.xl, width: 58, height: 58, borderRadius: BorderRadius.lg, backgroundColor: Colors.primaryDark, alignItems: 'center', justifyContent: 'center', ...Shadow.md },
});
