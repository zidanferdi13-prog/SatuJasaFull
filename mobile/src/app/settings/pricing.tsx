import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Modal,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useServiceTypes, usePricingRules, useCreatePricingRule, useUpdatePricingRule,
} from '@/modules/settings/hooks/useSettings';
import { PricingRule, ServiceType } from '@/shared/types';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '@/theme';
import { getErrorMessage } from '@/shared/services/api-error';

function PricingCard({ item, onEdit }: { item: PricingRule; onEdit: () => void }) {
  return (
    <View style={[styles.card, Shadow.sm]}>
      <View style={styles.cardInfo}>
        <Text style={styles.serviceTypeName}>{item.serviceType?.name || 'Layanan'}</Text>
        <Text style={styles.priceName}>{item.name}</Text>
        {item.description && <Text style={styles.priceDesc}>{item.description}</Text>}
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.priceValue}>Rp {item.price.toLocaleString('id-ID')}</Text>
        <Pressable onPress={onEdit} style={styles.editBtn}>
          <Ionicons name="create-outline" size={18} color={Colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

export default function PricingScreen() {
  const { data: pricingRules, isLoading, refetch } = usePricingRules();
  const { data: serviceTypes } = useServiceTypes();
  const createMutation = useCreatePricingRule();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formServiceTypeId, setFormServiceTypeId] = useState('');

  const updateMutation = useUpdatePricingRule(editingId || '');

  const openCreate = () => {
    setEditingId(null);
    setFormName(''); setFormDesc(''); setFormPrice(''); setFormServiceTypeId('');
    setShowModal(true);
  };

  const openEdit = (rule: PricingRule) => {
    setEditingId(rule.id);
    setFormName(rule.name);
    setFormDesc(rule.description || '');
    setFormPrice(String(rule.price));
    setFormServiceTypeId(rule.serviceTypeId || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formPrice || !formServiceTypeId) {
      Alert.alert('Error', 'Nama, harga, dan jenis layanan wajib diisi');
      return;
    }
    const payload = {
      name: formName.trim(),
      description: formDesc.trim() || undefined,
      price: parseFloat(formPrice),
      serviceTypeId: formServiceTypeId,
    };
    try {
      if (editingId) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      setShowModal(false);
    } catch (err) {
      Alert.alert('Gagal', getErrorMessage(err));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={pricingRules}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PricingCard item={item} onEdit={() => openEdit(item)} />}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="pricetag-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>Belum ada aturan harga</Text>
            </View>
          }
        />
      )}

      <Pressable style={styles.fab} onPress={openCreate}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Harga' : 'Tambah Harga'}</Text>
            <Pressable onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </Pressable>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Jenis Layanan *</Text>
            <View style={styles.serviceTypeList}>
              {serviceTypes?.map((st: ServiceType) => (
                <Pressable
                  key={st.id}
                  style={[styles.stChip, formServiceTypeId === st.id && styles.stChipActive]}
                  onPress={() => setFormServiceTypeId(st.id)}
                >
                  <Text style={[styles.stChipText, formServiceTypeId === st.id && styles.stChipTextActive]}>
                    {st.name}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.label, { marginTop: Spacing.md }]}>Nama Paket *</Text>
            <TextInput style={styles.input} value={formName} onChangeText={setFormName} placeholder="Cth: Standar, Premium..." />
            <Text style={[styles.label, { marginTop: Spacing.md }]}>Harga (Rp) *</Text>
            <TextInput style={styles.input} value={formPrice} onChangeText={setFormPrice} keyboardType="numeric" placeholder="0" />
            <Text style={[styles.label, { marginTop: Spacing.md }]}>Deskripsi</Text>
            <TextInput style={styles.input} value={formDesc} onChangeText={setFormDesc} placeholder="Opsional" />
            <Pressable
              style={[styles.saveBtn, isPending && styles.btnDisabled]}
              onPress={handleSave}
              disabled={isPending}
            >
              {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Simpan</Text>}
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
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
  },
  cardInfo: { flex: 1 },
  serviceTypeName: { ...Typography.caption, color: Colors.primary, fontWeight: '600' },
  priceName: { ...Typography.body, fontWeight: '700', color: Colors.text },
  priceDesc: { ...Typography.bodySmall, color: Colors.textSecondary },
  cardRight: { alignItems: 'flex-end', gap: Spacing.xs },
  priceValue: { ...Typography.h4, color: Colors.success },
  editBtn: { padding: 4 },
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
  serviceTypeList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  stChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border,
  },
  stChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stChipText: { ...Typography.bodySmall, color: Colors.textSecondary },
  stChipTextActive: { color: '#fff', fontWeight: '700' },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: 15, color: Colors.text, backgroundColor: Colors.surface,
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.xl,
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
