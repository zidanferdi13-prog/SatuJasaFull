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
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '../../theme';

function CustomerCard({ item, onPress }: { item: Customer; onPress: () => void }) {
  return (
    <Pressable style={[styles.card, Shadow.sm]} onPress={onPress}>
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
          {item.email && <Text style={styles.email}>{item.email}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      </View>
    </Pressable>
  );
}

export default function CustomerListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: customers, isLoading, refetch } = useCustomers(search.length >= 2 ? search : undefined);

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama atau nomor HP..."
          value={search}
          onChangeText={setSearch}
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
            <View style={styles.center}>
              <Ionicons name="people-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>Belum ada pelanggan</Text>
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...Typography.h4, color: Colors.primary },
  info: { flex: 1 },
  name: { ...Typography.body, fontWeight: '600', color: Colors.text },
  phone: { ...Typography.bodySmall, color: Colors.textSecondary },
  email: { ...Typography.caption, color: Colors.textLight },
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
