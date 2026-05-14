import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCreateTransaction } from '../../modules/transactions/hooks/useTransactions';
import { useCustomers } from '../../modules/customers/hooks/useCustomers';
import { useVehicles } from '../../modules/vehicles/hooks/useVehicles';
import { useServiceTypes } from '../../modules/settings/hooks/useSettings';
import { useAuthStore } from '../../store/authStore';
import { Customer, Vehicle, ServiceType } from '../../shared/types';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '../../theme';
import { getErrorMessage } from '../../shared/services/api-error';

interface TransactionItemInput {
  vehicleId: string;
  vehicle: Vehicle;
  serviceTypeId: string;
  serviceTypeName: string;
  estimatedPrice: string;
}

const STEPS = ['Pelanggan', 'Kendaraan', 'Ringkasan'];

export default function CreateTransactionScreen() {
  const router = useRouter();
  const { selectedBranch } = useAuthStore();
  const createMutation = useCreateTransaction();

  const [step, setStep] = useState(0);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<TransactionItemInput[]>([]);
  const [dpAmount, setDpAmount] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState<Vehicle | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [vehiclePrice, setVehiclePrice] = useState('');

  const { data: customers } = useCustomers(customerSearch.length >= 2 ? customerSearch : undefined);
  const { data: vehicles } = useVehicles({
    customerId: selectedCustomer?.id,
    search: vehicleSearch.length >= 2 ? vehicleSearch : undefined,
  });
  const { data: serviceTypes } = useServiceTypes();

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => {
    if (step === 0) router.back();
    else setStep((s) => s - 1);
  };

  const handleAddItem = () => {
    if (!addingVehicle || !selectedServiceType) return;
    const price = parseFloat(vehiclePrice) || 0;
    const existing = selectedItems.findIndex((i) => i.vehicleId === addingVehicle.id);
    const newItem: TransactionItemInput = {
      vehicleId: addingVehicle.id,
      vehicle: addingVehicle,
      serviceTypeId: selectedServiceType.id,
      serviceTypeName: selectedServiceType.name,
      estimatedPrice: String(price),
    };
    if (existing >= 0) {
      const updated = [...selectedItems];
      updated[existing] = newItem;
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, newItem]);
    }
    setAddingVehicle(null);
    setSelectedServiceType(null);
    setVehiclePrice('');
    setShowVehiclePicker(false);
  };

  const removeItem = (vehicleId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.vehicleId !== vehicleId));
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) return;
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Tambahkan minimal 1 kendaraan');
      return;
    }
    try {
      const payload = {
        branchId: selectedBranch?.id,
        customerId: selectedCustomer.id,
        items: selectedItems.map((item) => ({
          vehicleId: item.vehicleId,
          serviceTypeId: item.serviceTypeId,
          price: parseFloat(item.estimatedPrice) || 0,
        })),
        dpAmount: dpAmount ? parseFloat(dpAmount) : undefined,
        estimatedFinishDate: estimatedDate || undefined,
        notes: notes || undefined,
      };
      const transaction = await createMutation.mutateAsync(payload);
      router.replace(`/transactions/${transaction.id}` as `/${string}`);
    } catch (err) {
      Alert.alert('Gagal', getErrorMessage(err));
    }
  };

  const totalEstimate = selectedItems.reduce((sum, i) => sum + (parseFloat(i.estimatedPrice) || 0), 0);

  return (
    <View style={styles.container}>
      {/* Step indicator */}
      <View style={styles.stepBar}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepItemWrapper}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, i <= step && styles.stepDotTextActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* STEP 0: Select Customer */}
        {step === 0 && (
          <View>
            <Text style={styles.stepTitle}>Pilih Pelanggan</Text>
            {selectedCustomer ? (
              <View style={[styles.selectedCard, Shadow.sm]}>
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedName}>{selectedCustomer.name}</Text>
                  <Text style={styles.selectedSub}>{selectedCustomer.phone}</Text>
                </View>
                <Pressable onPress={() => setSelectedCustomer(null)}>
                  <Ionicons name="close-circle" size={24} color={Colors.danger} />
                </Pressable>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari nama atau nomor HP pelanggan..."
                  value={customerSearch}
                  onChangeText={setCustomerSearch}
                />
                {customers?.map((c) => (
                  <Pressable
                    key={c.id}
                    style={[styles.listItem, Shadow.sm]}
                    onPress={() => { setSelectedCustomer(c); setCustomerSearch(''); }}
                  >
                    <Text style={styles.listItemName}>{c.name}</Text>
                    <Text style={styles.listItemSub}>{c.phone}</Text>
                  </Pressable>
                ))}
              </>
            )}
          </View>
        )}

        {/* STEP 1: Add Vehicles */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Tambah Kendaraan</Text>
            {selectedItems.map((item) => (
              <View key={item.vehicleId} style={[styles.itemCard, Shadow.sm]}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemPlate}>{item.vehicle.plateNumber}</Text>
                  <Text style={styles.itemService}>{item.serviceTypeName}</Text>
                  <Text style={styles.itemPrice}>Rp {parseFloat(item.estimatedPrice).toLocaleString('id-ID')}</Text>
                </View>
                <Pressable onPress={() => removeItem(item.vehicleId)}>
                  <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                </Pressable>
              </View>
            ))}

            {!showVehiclePicker ? (
              <Pressable style={styles.addItemBtn} onPress={() => setShowVehiclePicker(true)}>
                <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.addItemBtnText}>Tambah Kendaraan</Text>
              </Pressable>
            ) : (
              <View style={[styles.pickerCard, Shadow.sm]}>
                <Text style={styles.pickerTitle}>Pilih Kendaraan</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari nomor plat..."
                  value={vehicleSearch}
                  onChangeText={setVehicleSearch}
                />
                {vehicles?.map((v) => (
                  <Pressable
                    key={v.id}
                    style={[styles.listItem, addingVehicle?.id === v.id && styles.listItemSelected]}
                    onPress={() => setAddingVehicle(v)}
                  >
                    <Text style={styles.listItemName}>{v.plateNumber}</Text>
                    <Text style={styles.listItemSub}>{[v.brand, v.model].filter(Boolean).join(' ')}</Text>
                  </Pressable>
                ))}

                {addingVehicle && (
                  <>
                    <Text style={[styles.pickerTitle, { marginTop: Spacing.md }]}>Jenis Layanan</Text>
                    {serviceTypes?.map((st) => (
                      <Pressable
                        key={st.id}
                        style={[styles.listItem, selectedServiceType?.id === st.id && styles.listItemSelected]}
                        onPress={() => setSelectedServiceType(st)}
                      >
                        <Text style={styles.listItemName}>{st.name}</Text>
                      </Pressable>
                    ))}

                    <Text style={[styles.pickerTitle, { marginTop: Spacing.md }]}>Harga Estimasi</Text>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Masukkan harga..."
                      value={vehiclePrice}
                      onChangeText={setVehiclePrice}
                      keyboardType="numeric"
                    />

                    <View style={styles.pickerActions}>
                      <Pressable style={styles.cancelBtn} onPress={() => {
                        setShowVehiclePicker(false);
                        setAddingVehicle(null);
                        setSelectedServiceType(null);
                        setVehiclePrice('');
                      }}>
                        <Text style={styles.cancelBtnText}>Batal</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.confirmBtn, (!addingVehicle || !selectedServiceType) && styles.btnDisabled]}
                        onPress={handleAddItem}
                        disabled={!addingVehicle || !selectedServiceType}
                      >
                        <Text style={styles.confirmBtnText}>Tambahkan</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            )}

            {selectedItems.length > 0 && (
              <View style={[styles.totalCard, Shadow.sm]}>
                <Text style={styles.totalLabel}>Estimasi Total</Text>
                <Text style={styles.totalValue}>Rp {totalEstimate.toLocaleString('id-ID')}</Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 2: Summary & Submit */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Ringkasan Transaksi</Text>
            <View style={[styles.card, Shadow.sm]}>
              <Text style={styles.sectionTitle}>Pelanggan</Text>
              <Text style={styles.cardValue}>{selectedCustomer?.name}</Text>
              <Text style={styles.cardSub}>{selectedCustomer?.phone}</Text>
            </View>

            <View style={[styles.card, Shadow.sm]}>
              <Text style={styles.sectionTitle}>{selectedItems.length} Kendaraan</Text>
              {selectedItems.map((item) => (
                <View key={item.vehicleId} style={styles.summaryItem}>
                  <Text style={styles.summaryPlate}>{item.vehicle.plateNumber}</Text>
                  <Text style={styles.summaryService}>{item.serviceTypeName}</Text>
                  <Text style={styles.summaryPrice}>Rp {parseFloat(item.estimatedPrice).toLocaleString('id-ID')}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.card, Shadow.sm]}>
              <Text style={styles.sectionTitle}>Detail Transaksi</Text>
              <Text style={styles.label}>DP (opsional)</Text>
              <TextInput
                style={styles.searchInput}
                value={dpAmount}
                onChangeText={setDpAmount}
                placeholder="0"
                keyboardType="numeric"
              />
              <Text style={[styles.label, { marginTop: Spacing.md }]}>Target Selesai (opsional)</Text>
              <TextInput
                style={styles.searchInput}
                value={estimatedDate}
                onChangeText={setEstimatedDate}
                placeholder="YYYY-MM-DD"
              />
              <Text style={[styles.label, { marginTop: Spacing.md }]}>Catatan (opsional)</Text>
              <TextInput
                style={[styles.searchInput, { height: 60, textAlignVertical: 'top' }]}
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholder="Catatan tambahan..."
              />
            </View>

            <View style={[styles.totalCard, Shadow.sm]}>
              <Text style={styles.totalLabel}>Estimasi Total</Text>
              <Text style={styles.totalValue}>Rp {totalEstimate.toLocaleString('id-ID')}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.backBtn} onPress={goBack}>
          <Text style={styles.backBtnText}>{step === 0 ? 'Batal' : 'Kembali'}</Text>
        </Pressable>

        {step < STEPS.length - 1 ? (
          <Pressable
            style={[styles.nextBtn, (!selectedCustomer && step === 0) && styles.btnDisabled]}
            onPress={goNext}
            disabled={!selectedCustomer && step === 0}
          >
            <Text style={styles.nextBtnText}>Lanjut</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        ) : (
          <Pressable
            style={[styles.nextBtn, createMutation.isPending && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextBtnText}>Buat Transaksi</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  stepBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepItemWrapper: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: Colors.primary },
  stepDotText: { fontSize: 12, fontWeight: '700', color: Colors.textLight },
  stepDotTextActive: { color: '#fff' },
  stepLabel: { ...Typography.caption, color: Colors.textSecondary },
  stepLabelActive: { color: Colors.primary, fontWeight: '700' },
  scrollContent: { padding: Spacing.md, paddingBottom: 80 },
  stepTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  selectedCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  selectedInfo: { flex: 1 },
  selectedName: { ...Typography.body, fontWeight: '700', color: Colors.text },
  selectedSub: { ...Typography.bodySmall, color: Colors.textSecondary },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  listItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listItemSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  listItemName: { ...Typography.body, fontWeight: '600', color: Colors.text },
  listItemSub: { ...Typography.bodySmall, color: Colors.textSecondary },
  itemCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  itemInfo: { flex: 1 },
  itemPlate: { ...Typography.body, fontWeight: '700', color: Colors.text },
  itemService: { ...Typography.bodySmall, color: Colors.textSecondary },
  itemPrice: { ...Typography.caption, color: Colors.primary, fontWeight: '600' },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    marginVertical: Spacing.sm,
    borderStyle: 'dashed',
  },
  addItemBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  pickerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  pickerTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.sm },
  pickerActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontWeight: '700' },
  totalCard: {
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  totalLabel: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  totalValue: { ...Typography.h3, color: Colors.primary },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.sm },
  cardValue: { ...Typography.body, fontWeight: '700', color: Colors.text },
  cardSub: { ...Typography.bodySmall, color: Colors.textSecondary },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  summaryPlate: { ...Typography.body, fontWeight: '700', color: Colors.text, width: 90 },
  summaryService: { ...Typography.bodySmall, color: Colors.textSecondary, flex: 1 },
  summaryPrice: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '600' },
  label: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' },
  bottomNav: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backBtnText: { color: Colors.textSecondary, fontWeight: '600' },
  nextBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
  },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
});
