import React, { useEffect, useState } from 'react';
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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCreateTransaction, useTransactionRequirements } from '../../modules/transactions/hooks/useTransactions';
import { useCustomers, useCreateCustomer } from '../../modules/customers/hooks/useCustomers';
import { useVehicles, useCreateVehicle } from '../../modules/vehicles/hooks/useVehicles';
import { useServiceTypes } from '../../modules/settings/hooks/useSettings';
import { Customer, Vehicle, ServiceType, MasterFeeRule } from '../../shared/types';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '../../theme';
import { getErrorMessage } from '../../shared/services/api-error';

interface EditableFeeRule extends MasterFeeRule {
  amount: string;
}

interface TransactionItemInput {
  vehicleId: string;
  vehicle: Vehicle;
  serviceTypeId: string;
  serviceTypeName: string;
  vehicleTypeCode: string;
  provinceCode: string;
  baseCost: number;
  serviceFee: number;
  estimatedPrice: string;
  feeDetails: { componentCode: string; amount: number }[];
}

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const DEFAULT_VEHICLE_TYPE_CODE = 'MOTOR';
const DEFAULT_PROVINCE_CODE = 'JABAR';
const SERVICE_FEE_COMPONENTS = new Set(['JASA_BIRO']);
const HIDDEN_FEE_COMPONENTS = new Set(['OPERASIONAL']);
const PENALTY_FEE_COMPONENTS = new Set(['PKB_DENDA', 'OPSEN_PKB_DENDA', 'SWDKLLJ_DENDA', 'DENDA_PKB', 'DENDA_SWDKLLJ']);
const parseMoneyInput = (value: string) => Number(value.replace(/[^\d]/g, '')) || 0;
const isPenaltyService = (serviceName?: string) => /mati|telat|denda/i.test(serviceName || '');
const isVisibleFee = (fee: { componentCode: string }, serviceName?: string) => (
  !HIDDEN_FEE_COMPONENTS.has(fee.componentCode) && (!PENALTY_FEE_COMPONENTS.has(fee.componentCode) || isPenaltyService(serviceName))
);
const sumAmounts = (items?: { defaultAmount?: number; amount?: string | number; componentCode?: string }[]) =>
  (items || []).reduce((sum, item) => sum + (typeof item.amount === 'string' ? parseMoneyInput(item.amount) : Number(item.amount ?? item.defaultAmount ?? 0)), 0);

const dpStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    paddingBottom: 32,
  },
  title: { ...Typography.h3, color: Colors.text, textAlign: 'center', marginBottom: Spacing.lg },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.lg },
  stepperCol: { alignItems: 'center', flex: 1 },
  stepperLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.sm },
  stepperBtn: { padding: Spacing.sm },
  stepperValueBox: {
    width: 72,
    height: 44,
    backgroundColor: Colors.primary + '18',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  stepperValue: { ...Typography.h4, color: Colors.primary, fontWeight: '700' },
  dpActions: { flexDirection: 'row', gap: Spacing.sm },
  dpCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dpCancelText: { color: Colors.textSecondary, fontWeight: '600' },
  dpConfirmBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dpConfirmText: { color: '#fff', fontWeight: '700' },
});

function StepperCol({
  label, value, onPrev, onNext,
}: { label: string; value: string; onPrev: () => void; onNext: () => void }) {
  return (
    <View style={dpStyles.stepperCol}>
      <Text style={dpStyles.stepperLabel}>{label}</Text>
      <Pressable style={dpStyles.stepperBtn} onPress={onNext}>
        <Ionicons name="chevron-up" size={22} color={Colors.primary} />
      </Pressable>
      <View style={dpStyles.stepperValueBox}>
        <Text style={dpStyles.stepperValue}>{value}</Text>
      </View>
      <Pressable style={dpStyles.stepperBtn} onPress={onPrev}>
        <Ionicons name="chevron-down" size={22} color={Colors.primary} />
      </Pressable>
    </View>
  );
}

function DatePickerModal({
  visible, value, onConfirm, onCancel,
}: { visible: boolean; value: string; onConfirm: (date: string) => void; onCancel: () => void }) {
  const today = new Date();
  const parse = () => {
    if (value) {
      const p = value.split('-').map(Number);
      if (p[0] && p[1] && p[2]) return { y: p[0], m: p[1], d: p[2] };
    }
    return { y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() };
  };
  const init = parse();
  const [selDay, setSelDay] = useState(init.d);
  const [selMonth, setSelMonth] = useState(init.m);
  const [selYear, setSelYear] = useState(init.y);

  const minYear = today.getFullYear();
  const maxYear = today.getFullYear() + 5;
  const maxDay = new Date(selYear, selMonth, 0).getDate();

  const adjDay = (d: number) => setSelDay(v => { const n = v + d; return n < 1 ? maxDay : n > maxDay ? 1 : n; });
  const adjMonth = (d: number) => setSelMonth(v => { const n = v + d; return n < 1 ? 12 : n > 12 ? 1 : n; });
  const adjYear = (d: number) => setSelYear(v => { const n = v + d; return n < minYear ? minYear : n > maxYear ? maxYear : n; });

  const handleConfirm = () => {
    const day = Math.min(selDay, new Date(selYear, selMonth, 0).getDate());
    onConfirm(`${selYear}-${String(selMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={dpStyles.overlay}>
        <View style={dpStyles.sheet}>
          <Text style={dpStyles.title}>Pilih Target Selesai</Text>
          <View style={dpStyles.pickerRow}>
            <StepperCol label="Hari" value={String(selDay).padStart(2, '0')} onPrev={() => adjDay(-1)} onNext={() => adjDay(1)} />
            <StepperCol label="Bulan" value={MONTHS_ID[selMonth - 1]} onPrev={() => adjMonth(-1)} onNext={() => adjMonth(1)} />
            <StepperCol label="Tahun" value={String(selYear)} onPrev={() => adjYear(-1)} onNext={() => adjYear(1)} />
          </View>
          <View style={dpStyles.dpActions}>
            <Pressable style={dpStyles.dpCancelBtn} onPress={onCancel}>
              <Text style={dpStyles.dpCancelText}>Batal</Text>
            </Pressable>
            <Pressable style={dpStyles.dpConfirmBtn} onPress={handleConfirm}>
              <Text style={dpStyles.dpConfirmText}>Pilih Tanggal</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const STEPS = ['Pelanggan', 'Kendaraan', 'Ringkasan'];

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <View style={styles.sectionHeaderCard}>
      <View style={styles.sectionStepBadge}>
        <Text style={styles.sectionStepText}>{step}</Text>
      </View>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}


export default function CreateTransactionScreen() {
  const router = useRouter();
  const createMutation = useCreateTransaction();
  const createCustomerMutation = useCreateCustomer();
  const createVehicleMutation = useCreateVehicle();

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
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [selectedVehicleTypeCode, setSelectedVehicleTypeCode] = useState(DEFAULT_VEHICLE_TYPE_CODE);
  const [editableFees, setEditableFees] = useState<EditableFeeRule[]>([]);

  // Inline add customer
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Inline add vehicle
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleBrand, setNewVehicleBrand] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');

  // Date picker
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: customers } = useCustomers(customerSearch.length >= 2 ? customerSearch : undefined);
  const { data: vehicles } = useVehicles({
    customerId: selectedCustomer?.id,
    search: vehicleSearch.length >= 2 ? vehicleSearch : undefined,
  });
  const { data: serviceTypes } = useServiceTypes();
  const { data: requirements, isFetching: isFetchingRequirements } = useTransactionRequirements({
    serviceTypeId: selectedServiceType?.id,
    vehicleTypeCode: selectedVehicleTypeCode,
    provinceCode: DEFAULT_PROVINCE_CODE,
  });

  useEffect(() => {
    setEditableFees((requirements?.feeRules || []).map((fee) => ({
      ...fee,
      amount: String(Number(fee.defaultAmount || 0)),
    })));
  }, [requirements]);

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const visibleFees = editableFees.filter((fee) => isVisibleFee(fee, selectedServiceType?.name));
  const officialFeeRules = visibleFees.filter((fee) => !SERVICE_FEE_COMPONENTS.has(fee.componentCode));
  const serviceFeeRules = visibleFees.filter((fee) => SERVICE_FEE_COMPONENTS.has(fee.componentCode));
  const currentVehicleFeeTotal = sumAmounts(officialFeeRules);
  const currentServiceFee = sumAmounts(serviceFeeRules);
  const currentVehicleGrossTotal = currentVehicleFeeTotal + currentServiceFee;
  const updateEditableFee = (componentCode: string, value: string) => {
    setEditableFees((fees) => fees.map((fee) => (
      fee.componentCode === componentCode ? { ...fee, amount: value.replace(/[^\d]/g, '') } : fee
    )));
  };

  const goBack = () => {
    if (step === 0) router.back();
    else setStep((s) => s - 1);
  };

  const handleAddItem = () => {
    if (!addingVehicle || !selectedServiceType) return;
    const baseCost = currentVehicleFeeTotal;
    const serviceFee = currentServiceFee;
    const existing = selectedItems.findIndex((i) => i.vehicleId === addingVehicle.id);
    const newItem: TransactionItemInput = {
      vehicleId: addingVehicle.id,
      vehicle: addingVehicle,
      serviceTypeId: selectedServiceType.id,
      serviceTypeName: selectedServiceType.name,
      vehicleTypeCode: selectedVehicleTypeCode,
      provinceCode: DEFAULT_PROVINCE_CODE,
      baseCost,
      serviceFee,
      estimatedPrice: String(baseCost + serviceFee),
      feeDetails: visibleFees.map((fee) => ({
        componentCode: fee.componentCode,
        amount: parseMoneyInput(fee.amount),
      })),
    };
    if (existing >= 0) {
      const updated = [...selectedItems];
      updated[existing] = newItem;
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, newItem]);
    }
    setAddingVehicle(null);
    setShowVehicleDropdown(false);
    setSelectedServiceType(null);
    setShowServiceDropdown(false);
    setSelectedVehicleTypeCode(DEFAULT_VEHICLE_TYPE_CODE);
    setEditableFees([]);
    setShowVehiclePicker(false);
  };

  const removeItem = (vehicleId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.vehicleId !== vehicleId));
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      Alert.alert('Error', 'Nama dan nomor HP wajib diisi');
      return;
    }
    try {
      const customer = await createCustomerMutation.mutateAsync({
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
      });
      setSelectedCustomer(customer);
      setShowAddCustomer(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
    } catch (err) {
      Alert.alert('Gagal', getErrorMessage(err));
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehiclePlate.trim() || !selectedCustomer) return;
    try {
      const vehicle = await createVehicleMutation.mutateAsync({
        customerId: selectedCustomer.id,
        plateNumber: newVehiclePlate.trim().toUpperCase(),
        brand: newVehicleBrand.trim() || undefined,
        model: newVehicleModel.trim() || undefined,
      });
      setAddingVehicle(vehicle);
      setShowAddVehicle(false);
      setNewVehiclePlate('');
      setNewVehicleBrand('');
      setNewVehicleModel('');
    } catch (err) {
      Alert.alert('Gagal', getErrorMessage(err));
    }
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) return;
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Tambahkan minimal 1 kendaraan');
      return;
    }
    try {
      const payload = {
        customerId: selectedCustomer.id,
        items: selectedItems.map((item) => ({
          vehicleId: item.vehicleId,
          serviceTypeId: item.serviceTypeId,
          vehicleTypeCode: item.vehicleTypeCode,
          provinceCode: item.provinceCode,
          feeDetails: item.feeDetails,
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

  const totalBaseCost = selectedItems.reduce((sum, item) => sum + item.baseCost, 0);
  const totalServiceFee = selectedItems.reduce((sum, item) => sum + item.serviceFee, 0);
  const totalEstimate = selectedItems.reduce((sum, i) => sum + (parseFloat(i.estimatedPrice) || 0), 0);

  return (
    <View style={styles.container}>


      <View style={[styles.stepBar, { marginTop: Spacing.lg }]}>
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
          <View style={styles.stepCard}>
            <StepHeader step={1} title="Pilih Pelanggan" subtitle="Cari pelanggan lama atau tambahkan pelanggan baru." />
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

                {!showAddCustomer ? (
                  <Pressable style={styles.addItemBtn} onPress={() => setShowAddCustomer(true)}>
                    <Ionicons name="person-add-outline" size={18} color={Colors.primary} />
                    <Text style={styles.addItemBtnText}>Tambah Pelanggan Baru</Text>
                  </Pressable>
                ) : (
                  <View style={[styles.pickerCard, Shadow.sm]}>
                    <Text style={styles.pickerTitle}>Data Pelanggan Baru</Text>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Nama lengkap *"
                      value={newCustomerName}
                      onChangeText={setNewCustomerName}
                      autoCapitalize="words"
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Nomor HP *"
                      value={newCustomerPhone}
                      onChangeText={setNewCustomerPhone}
                      keyboardType="phone-pad"
                    />
                    <View style={styles.pickerActions}>
                      <Pressable
                        style={styles.cancelBtn}
                        onPress={() => { setShowAddCustomer(false); setNewCustomerName(''); setNewCustomerPhone(''); }}
                      >
                        <Text style={styles.cancelBtnText}>Batal</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.confirmBtn, createCustomerMutation.isPending && styles.btnDisabled]}
                        onPress={handleAddCustomer}
                        disabled={createCustomerMutation.isPending}
                      >
                        {createCustomerMutation.isPending
                          ? <ActivityIndicator color="#fff" size="small" />
                          : <Text style={styles.confirmBtnText}>Simpan</Text>}
                      </Pressable>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* STEP 1: Add Vehicles */}
        {step === 1 && (
          <View style={styles.stepCard}>
            <StepHeader step={2} title="Detail Kendaraan" subtitle="Pilih kendaraan, layanan, lalu isi estimasi biaya STNK." />
            {selectedItems.map((item) => (
              <View key={item.vehicleId} style={[styles.itemCard, Shadow.sm]}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemPlate}>{item.vehicle.plateNumber}</Text>
                  <Text style={styles.itemService}>{item.serviceTypeName}</Text>
                  <Text style={styles.itemPrice}>Total tagihan: Rp {parseFloat(item.estimatedPrice).toLocaleString('id-ID')}</Text>
                  <Text style={styles.itemMeta}>Jasa biro: Rp {item.serviceFee.toLocaleString('id-ID')}</Text>
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
                {addingVehicle ? (
                  <View style={styles.selectedVehicleCard}>
                    <View style={styles.selectedVehicleIcon}>
                      <Ionicons name="car-outline" size={22} color={Colors.primaryDark} />
                    </View>
                    <View style={styles.selectedVehicleInfo}>
                      <Text style={styles.selectedVehiclePlate}>{addingVehicle.plateNumber}</Text>
                      <Text style={styles.selectedVehicleMeta}>{[addingVehicle.brand, addingVehicle.model].filter(Boolean).join(' ') || 'Kendaraan terpilih'}</Text>
                    </View>
                    <Pressable
                      style={styles.changeVehicleBtn}
                      onPress={() => {
                        setAddingVehicle(null);
                        setSelectedServiceType(null);
                        setShowServiceDropdown(false);
                        setShowVehicleDropdown(true);
                      }}
                    >
                      <Text style={styles.changeVehicleText}>Ganti</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Cari nomor plat..."
                      value={vehicleSearch}
                      onChangeText={(value) => {
                        setVehicleSearch(value);
                        setShowVehicleDropdown(true);
                      }}
                    />
                    <Pressable
                      style={styles.dropdownButton}
                      onPress={() => setShowVehicleDropdown((visible) => !visible)}
                    >
                      <Text style={styles.dropdownPlaceholder}>Pilih kendaraan</Text>
                      <Ionicons
                        name={showVehicleDropdown ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={Colors.textSecondary}
                      />
                    </Pressable>
                    {showVehicleDropdown && (
                      <View style={styles.dropdownList}>
                        {vehicles?.map((v) => (
                          <Pressable
                            key={v.id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setAddingVehicle(v);
                              setShowAddVehicle(false);
                              setShowVehicleDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{v.plateNumber}</Text>
                            <Text style={styles.dropdownItemSubText}>{[v.brand, v.model].filter(Boolean).join(' ') || 'Tanpa detail kendaraan'}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}

                    {!showAddVehicle ? (
                      <Pressable
                        style={[styles.addItemBtn, { marginTop: Spacing.xs }]}
                        onPress={() => { setShowAddVehicle(true); setAddingVehicle(null); }}
                      >
                        <Ionicons name="car-outline" size={18} color={Colors.primary} />
                        <Text style={styles.addItemBtnText}>Tambah Kendaraan Baru</Text>
                      </Pressable>
                    ) : (
                      <View style={{ marginTop: Spacing.sm }}>
                        <Text style={styles.pickerTitle}>Data Kendaraan Baru</Text>
                        <TextInput
                          style={styles.searchInput}
                          placeholder="Nomor plat * (cth: B1234ABC)"
                          value={newVehiclePlate}
                          onChangeText={setNewVehiclePlate}
                          autoCapitalize="characters"
                        />
                        <TextInput
                          style={styles.searchInput}
                          placeholder="Merek (opsional, cth: Honda)"
                          value={newVehicleBrand}
                          onChangeText={setNewVehicleBrand}
                          autoCapitalize="words"
                        />
                        <TextInput
                          style={styles.searchInput}
                          placeholder="Model (opsional, cth: Beat)"
                          value={newVehicleModel}
                          onChangeText={setNewVehicleModel}
                        />
                        <View style={styles.pickerActions}>
                          <Pressable
                            style={styles.cancelBtn}
                            onPress={() => { setShowAddVehicle(false); setNewVehiclePlate(''); setNewVehicleBrand(''); setNewVehicleModel(''); }}
                          >
                            <Text style={styles.cancelBtnText}>Batal</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.confirmBtn, (!newVehiclePlate.trim() || createVehicleMutation.isPending) && styles.btnDisabled]}
                            onPress={handleAddVehicle}
                            disabled={!newVehiclePlate.trim() || createVehicleMutation.isPending}
                          >
                            {createVehicleMutation.isPending
                              ? <ActivityIndicator color="#fff" size="small" />
                              : <Text style={styles.confirmBtnText}>Simpan</Text>}
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </>
                )}

                {addingVehicle && (
                  <>
                    <Text style={[styles.pickerTitle, { marginTop: Spacing.md }]}>Jenis Layanan</Text>
                    <Pressable
                      style={styles.dropdownButton}
                      onPress={() => setShowServiceDropdown((visible) => !visible)}
                    >
                      <Text style={selectedServiceType ? styles.dropdownText : styles.dropdownPlaceholder}>
                        {selectedServiceType?.name || 'Pilih jenis layanan'}
                      </Text>
                      <Ionicons
                        name={showServiceDropdown ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={Colors.textSecondary}
                      />
                    </Pressable>
                    {showServiceDropdown && (
                      <View style={styles.dropdownList}>
                        {serviceTypes?.map((st) => (
                          <Pressable
                            key={st.id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedServiceType(st);
                              setShowServiceDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{st.name}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}

                    <Text style={[styles.pickerTitle, { marginTop: Spacing.md }]}>Tipe Kendaraan</Text>
                    <View style={styles.vehicleTypeRow}>
                      {['MOTOR', 'MOBIL', 'PICKUP', 'TRUK', 'BUS', 'LAINNYA'].map((code) => (
                        <Pressable
                          key={code}
                          style={[styles.vehicleTypeChip, selectedVehicleTypeCode === code && styles.vehicleTypeChipActive]}
                          onPress={() => setSelectedVehicleTypeCode(code)}
                        >
                          <Text style={[styles.vehicleTypeChipText, selectedVehicleTypeCode === code && styles.vehicleTypeChipTextActive]}>{code}</Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={[styles.pickerTitle, { marginTop: Spacing.md }]}>Informasi Biaya</Text>
                    <Text style={styles.feeHelpText}>Isi biaya sesuai notice/STNK. Jasa Biro otomatis dari Aturan Harga tenant.</Text>
                    {isFetchingRequirements ? (
                      <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.md }} />
                    ) : requirements?.feeRules?.length ? (
                      <>
                        <View style={styles.feeGroupCard}>
                          <Text style={styles.feeGroupTitle}>Biaya Resmi / Pajak</Text>
                          {officialFeeRules.map((fee) => (
                            <View key={fee.id} style={styles.feeRow}>
                              <Text style={styles.feeLabel}>{fee.componentName}</Text>
                              <Text style={styles.feeCurrency}>Rp</Text>
                              <TextInput
                                style={styles.feeInput}
                                value={fee.amount}
                                onChangeText={(value) => updateEditableFee(fee.componentCode, value)}
                                keyboardType="numeric"
                                placeholder="0"
                              />
                            </View>
                          ))}
                          <View style={styles.feeSubtotalRow}>
                            <Text style={styles.feeSubtotalLabel}>Subtotal biaya resmi</Text>
                            <Text style={styles.feeSubtotalValue}>Rp {currentVehicleFeeTotal.toLocaleString('id-ID')}</Text>
                          </View>
                        </View>

                        <View style={styles.feeGroupCard}>
                          <Text style={styles.feeGroupTitle}>Jasa Biro</Text>
                          {serviceFeeRules.map((fee) => (
                            <View key={fee.id} style={styles.feeRow}>
                              <Text style={styles.feeLabel}>{fee.componentName}</Text>
                              <Text style={styles.feeSystemValue}>Rp {parseMoneyInput(fee.amount).toLocaleString('id-ID')}</Text>
                            </View>
                          ))}
                          <View style={styles.feeSubtotalRow}>
                            <Text style={styles.feeSubtotalLabel}>Subtotal jasa</Text>
                            <Text style={styles.feeSubtotalValue}>Rp {currentServiceFee.toLocaleString('id-ID')}</Text>
                          </View>
                        </View>
                      </>
                    ) : (
                      <Text style={styles.feeHelpText}>Pilih layanan untuk melihat rincian biaya.</Text>
                    )}
                    {!!requirements?.documentRequirements?.length && (
                      <View style={styles.feeGroupCard}>
                        <Text style={styles.feeGroupTitle}>Checklist Dokumen</Text>
                        {requirements.documentRequirements.map((doc) => (
                          <Text key={doc.id} style={styles.summaryFee}>• {doc.documentName}</Text>
                        ))}
                      </View>
                    )}
                    <View style={styles.feeFormulaBox}>
                      <Text style={styles.feeFormulaText}>
                        Total = biaya pajak/resmi Rp {currentVehicleFeeTotal.toLocaleString('id-ID')} + jasa biro Rp {currentServiceFee.toLocaleString('id-ID')}
                      </Text>
                    </View>
                    <View style={styles.feeTotalRow}>
                      <Text style={styles.feeTotalLabel}>Total tagihan kendaraan</Text>
                      <Text style={styles.feeTotalValue}>Rp {currentVehicleGrossTotal.toLocaleString('id-ID')}</Text>
                    </View>

                    <View style={styles.pickerActions}>
                      <Pressable style={styles.cancelBtn} onPress={() => {
                        setShowVehiclePicker(false);
                        setAddingVehicle(null);
                        setSelectedServiceType(null);
                        setShowServiceDropdown(false);
                        setSelectedVehicleTypeCode(DEFAULT_VEHICLE_TYPE_CODE);
                      }}>
                        <Text style={styles.cancelBtnText}>Batal</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.confirmBtn, (!addingVehicle || !selectedServiceType || !requirements?.feeRules?.length) && styles.btnDisabled]}
                        onPress={handleAddItem}
                        disabled={!addingVehicle || !selectedServiceType || !requirements?.feeRules?.length}
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
                <View>
                  <Text style={styles.totalLabel}>Estimasi Total Tagihan</Text>
                  <Text style={styles.totalMeta}>Modal: Rp {totalBaseCost.toLocaleString('id-ID')}</Text>
                  <Text style={styles.totalMeta}>Jasa biro: Rp {totalServiceFee.toLocaleString('id-ID')}</Text>
                </View>
                <Text style={styles.totalValue}>Rp {totalEstimate.toLocaleString('id-ID')}</Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 2: Summary & Submit */}
        {step === 2 && (
          <View style={styles.stepCard}>
            <StepHeader step={3} title="Ringkasan Transaksi" subtitle="Cek data, DP, target selesai, dan catatan sebelum disimpan." />
            <View style={[styles.card, Shadow.sm]}>
              <Text style={styles.sectionTitle}>Pelanggan</Text>
              <Text style={styles.cardValue}>{selectedCustomer?.name}</Text>
              <Text style={styles.cardSub}>{selectedCustomer?.phone}</Text>
            </View>

            <View style={[styles.card, Shadow.sm]}>
              <Text style={styles.sectionTitle}>{selectedItems.length} Kendaraan</Text>
              {selectedItems.map((item) => (
                <View key={item.vehicleId} style={styles.summaryItem}>
                  <View style={styles.summaryMain}>
                    <Text style={styles.summaryPlate}>{item.vehicle.plateNumber}</Text>
                    <Text style={styles.summaryService}>{item.serviceTypeName}</Text>
                    <Text style={styles.summaryFee}>Tipe: {item.vehicleTypeCode}</Text>
                    <Text style={styles.summaryFee}>Modal/biaya resmi: Rp {item.baseCost.toLocaleString('id-ID')}</Text>
                    <Text style={styles.summaryFee}>Jasa biro: Rp {item.serviceFee.toLocaleString('id-ID')}</Text>
                  </View>
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
              <Pressable
                style={[styles.searchInput, styles.datePickerBtn]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={estimatedDate ? styles.datePickerText : styles.datePickerPlaceholder}>
                  {estimatedDate
                    ? (() => { const [y, m, d] = estimatedDate.split('-'); return `${d} ${MONTHS_ID[parseInt(m) - 1]} ${y}`; })()
                    : 'Pilih tanggal...'}
                </Text>
                <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
              </Pressable>
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

      <DatePickerModal
        visible={showDatePicker}
        value={estimatedDate}
        onConfirm={(date) => { setEstimatedDate(date); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
      />

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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.md,
  },
  headerTitle: { fontSize: 26, lineHeight: 32, fontWeight: '900', color: Colors.text },
  headerSubtitle: { fontSize: 14, lineHeight: 20, color: Colors.textSecondary, marginTop: Spacing.xs },
  stepBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  stepItemWrapper: { flex: 1, alignItems: 'center', gap: 6 },
  stepDot: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#C3C6D6',
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: Colors.primaryDark, borderColor: Colors.primaryDark },
  stepDotText: { fontSize: 12, fontWeight: '800', color: Colors.textLight },
  stepDotTextActive: { color: '#fff' },
  stepLabel: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center' },
  stepLabelActive: { color: Colors.primaryDark, fontWeight: '800' },
  scrollContent: { padding: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 96 },
  stepCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#C3C6D6',
    ...Shadow.sm,
  },
  sectionHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionStepBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryDark,
  },
  sectionStepText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  sectionHeaderText: { flex: 1 },
  stepTitle: { ...Typography.h3, color: Colors.text },
  stepSubtitle: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
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
    borderColor: '#C3C6D6',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  listItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#C3C6D6',
  },
  listItemSelected: { borderColor: Colors.primaryDark, borderWidth: 2, backgroundColor: Colors.primaryLight },
  listItemName: { ...Typography.body, fontWeight: '600', color: Colors.text },
  listItemSub: { ...Typography.bodySmall, color: Colors.textSecondary },
  itemCard: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#C3C6D6',
  },
  itemInfo: { flex: 1 },
  itemPlate: { ...Typography.body, fontWeight: '700', color: Colors.text },
  itemService: { ...Typography.bodySmall, color: Colors.textSecondary },
  itemPrice: { ...Typography.caption, color: Colors.primary, fontWeight: '600' },
  itemMeta: { ...Typography.caption, color: Colors.textSecondary },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primaryDark,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    marginVertical: Spacing.sm,
    borderStyle: 'dashed',
    backgroundColor: Colors.primaryLight,
  },
  addItemBtnText: { color: Colors.primaryDark, fontWeight: '800', fontSize: 15 },
  pickerCard: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#C3C6D6',
  },
  pickerTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.sm },
  dropdownButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#C3C6D6',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  dropdownText: { ...Typography.body, color: Colors.text, fontWeight: '600' },
  dropdownSubText: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  dropdownPlaceholder: { ...Typography.body, color: Colors.textLight },
  dropdownList: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#C3C6D6',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  dropdownItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  dropdownItemText: { ...Typography.body, color: Colors.text, fontWeight: '600' },
  dropdownItemSubText: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  selectedVehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  selectedVehicleIcon: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  selectedVehicleInfo: { flex: 1 },
  selectedVehiclePlate: { ...Typography.body, color: Colors.text, fontWeight: '900' },
  selectedVehicleMeta: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  changeVehicleBtn: {
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
  },
  changeVehicleText: { color: Colors.primaryDark, fontSize: 12, fontWeight: '800' },
  feeHelpText: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.sm },
  feeGroupCard: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    padding: Spacing.md,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  feeGroupTitle: { ...Typography.bodySmall, color: Colors.text, fontWeight: '900' },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  feeLabel: { ...Typography.bodySmall, color: Colors.text, flex: 1, fontWeight: '500' },
  feeReadOnlyValue: { ...Typography.bodySmall, color: Colors.text, fontWeight: '700', textAlign: 'right' },
  feeCurrency: { ...Typography.bodySmall, color: Colors.textSecondary, fontWeight: '800' },
  feeSystemValue: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '900', textAlign: 'right' },
  feeSubtotalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 8, marginTop: 2 },
  feeSubtotalLabel: { ...Typography.bodySmall, color: Colors.text, fontWeight: '800' },
  feeSubtotalValue: { ...Typography.bodySmall, color: Colors.text, fontWeight: '900' },
  feeFormulaBox: { backgroundColor: Colors.primary + '10', borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
  feeFormulaText: { ...Typography.caption, color: Colors.primary, fontWeight: '700' },
  vehicleTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  vehicleTypeChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
  },
  vehicleTypeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '12' },
  vehicleTypeChipText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '700' },
  vehicleTypeChipTextActive: { color: Colors.primary },
  feeInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surface,
    width: 120,
    textAlign: 'right',
    fontWeight: '700',
  },
  feeTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary + '12',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.xs,
  },
  feeTotalLabel: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '700' },
  feeTotalValue: { ...Typography.body, color: Colors.primary, fontWeight: '700' },
  feeBreakdown: { gap: 4, marginTop: Spacing.xs },
  feeTotalRowPlain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feeBreakdownLabel: { ...Typography.bodySmall, color: Colors.textSecondary },
  feeBreakdownValue: { ...Typography.bodySmall, color: Colors.text, fontWeight: '600' },
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
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadow.md,
  },
  totalLabel: { ...Typography.body, color: 'rgba(255,255,255,0.82)', fontWeight: '700' },
  totalMeta: { ...Typography.caption, color: 'rgba(255,255,255,0.68)', marginTop: 2 },
  totalValue: { ...Typography.h3, color: '#fff' },
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
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  summaryMain: { flex: 1 },
  summaryPlate: { ...Typography.body, fontWeight: '700', color: Colors.text },
  summaryService: { ...Typography.bodySmall, color: Colors.textSecondary },
  summaryFee: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  summaryPrice: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '600' },
  label: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' },
  bottomNav: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#C3C6D6',
  },
  backBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C3C6D6',
    borderRadius: BorderRadius.lg,
    paddingVertical: 15,
    alignItems: 'center',
  },
  backBtnText: { color: Colors.textSecondary, fontWeight: '600' },
  nextBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.lg,
    paddingVertical: 15,
  },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
  datePickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  datePickerText: { fontSize: 14, color: Colors.text },
  datePickerPlaceholder: { fontSize: 14, color: '#aaa' },
});
