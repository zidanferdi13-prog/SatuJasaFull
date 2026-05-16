import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Modal,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useServiceTypes, usePricingRules, useCreatePricingRule, useUpdatePricingRule, useCreateServiceType,
} from '@/modules/settings/hooks/useSettings';
import { PricingRule, ServiceType } from '@/shared/types';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '@/theme';
import { getErrorMessage } from '@/shared/services/api-error';

function PricingCard({ item, onEdit }: { item: PricingRule; onEdit: () => void }) {
  return (
    <View style={[styles.card, Shadow.sm]}>
      <View style={styles.cardIcon}>
        <Ionicons name="briefcase-outline" size={22} color={Colors.primary} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.serviceTypeName}>{item.serviceType?.name || 'Layanan'}</Text>
        <Text style={styles.priceDesc}>Jasa biro per transaksi</Text>
        <Text style={styles.priceValue}>Rp {item.marginAmount.toLocaleString('id-ID')}</Text>
      </View>
      <Pressable onPress={onEdit} style={styles.editBtn}>
        <Ionicons name="create-outline" size={18} color={Colors.primary} />
      </Pressable>
    </View>
  );
}

export default function PricingScreen() {
  const { data: pricingRules, isLoading, refetch } = usePricingRules();
  const { data: serviceTypes } = useServiceTypes();
  const createMutation = useCreatePricingRule();
  const createServiceTypeMutation = useCreateServiceType();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMarginAmount, setFormMarginAmount] = useState('');
  const [formServiceTypeId, setFormServiceTypeId] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');

  const updateMutation = useUpdatePricingRule(editingId || '');

  const selectedServiceType = serviceTypes?.find((serviceType) => serviceType.id === formServiceTypeId);

  const openCreate = () => {
    setEditingId(null);
    setFormMarginAmount(''); setFormServiceTypeId(''); setShowServiceDropdown(false); setShowAddService(false);
    setNewServiceName('');
    setShowModal(true);
  };

  const openEdit = (rule: PricingRule) => {
    setEditingId(rule.id);
    setFormMarginAmount(String(rule.marginAmount));
    setFormServiceTypeId(rule.serviceTypeId || '');
    setShowServiceDropdown(false);
    setShowAddService(false);
    setNewServiceName('');
    setShowModal(true);
  };

  const handleAddServiceType = async () => {
    if (!newServiceName.trim()) {
      Alert.alert('Error', 'Nama jasa layanan wajib diisi');
      return;
    }
    try {
      const serviceType = await createServiceTypeMutation.mutateAsync({ name: newServiceName.trim() });
      setFormServiceTypeId(serviceType.id);
      setNewServiceName('');
      setShowAddService(false);
      setShowServiceDropdown(false);
    } catch (err) {
      Alert.alert('Gagal', getErrorMessage(err));
    }
  };

  const handleSave = async () => {
    if (!formServiceTypeId || !formMarginAmount) {
      Alert.alert('Error', 'Jenis layanan dan harga jasa wajib diisi');
      return;
    }
    const payload = {
      marginAmount: parseFloat(formMarginAmount),
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

  const isPending = createMutation.isPending || updateMutation.isPending || createServiceTypeMutation.isPending;

  return (
    <View style={styles.container}>
      <View style={[styles.header, Shadow.md]}>
        <View style={styles.headerBadge}>
          <Ionicons name="pricetags-outline" size={22} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Aturan Harga Jasa</Text>
        <Text style={styles.headerSubtitle}>Kelola fee jasa biro untuk setiap layanan. Biaya modal STNK tetap diinput saat transaksi.</Text>
      </View>

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
            <View style={[styles.emptyCard, Shadow.sm]}>
              <View style={styles.emptyIcon}>
                <Ionicons name="pricetag-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Belum ada aturan harga</Text>
              <Text style={styles.emptyText}>Tambahkan jasa layanan dan nominal fee biro untuk mulai menghitung revenue otomatis.</Text>
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
            <View>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Harga Jasa' : 'Tambah Harga Jasa'}</Text>
              <Text style={styles.modalSubtitle}>Pilih layanan lalu isi fee jasa biro.</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={22} color={Colors.text} />
            </Pressable>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Jenis Jasa Layanan *</Text>
            <Pressable style={styles.dropdownButton} onPress={() => setShowServiceDropdown((visible) => !visible)}>
              <Text style={selectedServiceType ? styles.dropdownText : styles.dropdownPlaceholder}>
                {selectedServiceType?.name || 'Pilih jasa layanan'}
              </Text>
              <Ionicons name={showServiceDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textSecondary} />
            </Pressable>
            {showServiceDropdown && (
              <View style={styles.dropdownList}>
                {serviceTypes?.map((st: ServiceType) => (
                  <Pressable
                    key={st.id}
                    style={styles.dropdownItem}
                    onPress={() => { setFormServiceTypeId(st.id); setShowServiceDropdown(false); }}
                  >
                    <Text style={styles.dropdownItemText}>{st.name}</Text>
                  </Pressable>
                ))}
                <Pressable style={styles.addServiceButton} onPress={() => setShowAddService(true)}>
                  <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
                  <Text style={styles.addServiceText}>Tambah jasa layanan baru</Text>
                </Pressable>
              </View>
            )}
            {showAddService && (
              <View style={styles.addServiceBox}>
                <TextInput
                  style={styles.input}
                  value={newServiceName}
                  onChangeText={setNewServiceName}
                  placeholder="Nama jasa layanan"
                />
                <View style={styles.addServiceActions}>
                  <Pressable style={styles.cancelSmallBtn} onPress={() => { setShowAddService(false); setNewServiceName(''); }}>
                    <Text style={styles.cancelSmallText}>Batal</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.confirmSmallBtn, createServiceTypeMutation.isPending && styles.btnDisabled]}
                    onPress={handleAddServiceType}
                    disabled={createServiceTypeMutation.isPending}
                  >
                    <Text style={styles.confirmSmallText}>Tambah</Text>
                  </Pressable>
                </View>
              </View>
            )}
            <Text style={[styles.label, { marginTop: Spacing.md }]}>Harga Jasa Biro (Rp) *</Text>
            <TextInput style={styles.input} value={formMarginAmount} onChangeText={setFormMarginAmount} keyboardType="numeric" placeholder="0" />
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
  header: {
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primaryDark,
  },
  headerBadge: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginBottom: Spacing.md,
  },
  headerTitle: { ...Typography.h2, color: '#fff' },
  headerSubtitle: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.76)', marginTop: Spacing.xs, lineHeight: 18 },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: 96 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  cardInfo: { flex: 1 },
  serviceTypeName: { ...Typography.h4, color: Colors.text },
  priceDesc: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  priceValue: { ...Typography.h3, color: Colors.primary, marginTop: Spacing.xs },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    marginBottom: Spacing.md,
  },
  emptyTitle: { ...Typography.h4, color: Colors.text },
  emptyText: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' },
  fab: {
    position: 'absolute', bottom: Spacing.xl, right: Spacing.xl,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalTitle: { ...Typography.h3, color: Colors.text },
  modalSubtitle: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceMuted,
  },
  modalContent: { padding: Spacing.md },
  label: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '700' },
  dropdownButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: { ...Typography.body, color: Colors.text },
  dropdownPlaceholder: { ...Typography.body, color: Colors.textLight },
  dropdownList: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xs,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  dropdownItem: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  dropdownItemText: { ...Typography.body, color: Colors.text },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
  },
  addServiceText: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '700' },
  addServiceBox: { marginTop: Spacing.sm },
  addServiceActions: { flexDirection: 'row', gap: Spacing.sm },
  cancelSmallBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelSmallText: { color: Colors.textSecondary, fontWeight: '600' },
  confirmSmallBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  confirmSmallText: { color: '#fff', fontWeight: '700' },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    fontSize: 15, color: Colors.text, backgroundColor: Colors.surface,
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.lg,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.xl,
    ...Shadow.sm,
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
