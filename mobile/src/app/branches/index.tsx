import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput,
  Alert, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBranches, useCreateBranch } from '../../modules/branches/hooks/useBranches';
import { Branch } from '../../shared/types';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '../../theme';
import { getErrorMessage } from '../../shared/services/api-error';

function BranchCard({ item }: { item: Branch }) {
  return (
    <View style={[styles.card, Shadow.sm]}>
      <View style={styles.cardIcon}>
        <Ionicons name="business-outline" size={20} color={Colors.primary} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.branchName}>{item.name}</Text>
        {item.address && <Text style={styles.branchAddress}>{item.address}</Text>}
        {item.phone && <Text style={styles.branchPhone}>{item.phone}</Text>}
      </View>
    </View>
  );
}

export default function BranchListScreen() {
  const { data: branches, isLoading, refetch } = useBranches();
  const createMutation = useCreateBranch();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Nama cabang wajib diisi');
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setShowModal(false);
      setName(''); setAddress(''); setPhone('');
    } catch (err) {
      Alert.alert('Gagal', getErrorMessage(err));
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={branches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BranchCard item={item} />}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="business-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>Belum ada cabang</Text>
            </View>
          }
        />
      )}

      <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tambah Cabang</Text>
            <Pressable onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.label}>Nama Cabang *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nama cabang"
              autoCapitalize="words"
            />
            <Text style={[styles.label, { marginTop: Spacing.md }]}>Alamat</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              value={address}
              onChangeText={setAddress}
              placeholder="Alamat cabang"
              multiline
            />
            <Text style={[styles.label, { marginTop: Spacing.md }]}>Nomor Telepon</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Nomor telepon cabang"
              keyboardType="phone-pad"
            />
            <Pressable
              style={[styles.submitBtn, createMutation.isPending && styles.btnDisabled]}
              onPress={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Simpan</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'] },
  listContent: { padding: Spacing.md, paddingBottom: 80 },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    flexDirection: 'row', gap: Spacing.md, alignItems: 'center',
  },
  cardIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  branchName: { ...Typography.body, fontWeight: '700', color: Colors.text },
  branchAddress: { ...Typography.bodySmall, color: Colors.textSecondary },
  branchPhone: { ...Typography.caption, color: Colors.primary },
  emptyText: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.md },
  fab: {
    position: 'absolute', bottom: Spacing.xl, right: Spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { ...Typography.h3, color: Colors.text },
  modalContent: { padding: Spacing.md },
  label: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: 15, color: Colors.text, backgroundColor: Colors.surface,
  },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.xl,
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
