import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Picker,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { transactionAPI } from '../api/transactions';
import { useAuthStore } from '../store/authStore';

export default function TransactionScreen() {
  const { services, setServices } = useTransactionStore();
  const user = useAuthStore((state) => state.user);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoadingServices(true);
    try {
      const response = await transactionAPI.list(0);
      setServices(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedService(response.data[0].service_id);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      Alert.alert('Error', 'Gagal memuat data layanan');
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!customerName || !customerPhone || !selectedService) {
      Alert.alert('Error', 'Nama customer, nomor telepon, dan layanan harus diisi');
      return;
    }

    setIsLoading(true);
    try {
      const result = await transactionAPI.create({
        customer_data: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail || undefined,
          vehicle_number: vehicleNumber || undefined,
        },
        service_id: selectedService,
        payment_method: 'CASH',
      });

      Alert.alert('Sukses', 'Transaksi berhasil dibuat', [
        {
          text: 'OK',
          onPress: () => {
            setCustomerName('');
            setCustomerPhone('');
            setCustomerEmail('');
            setVehicleNumber('');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Gagal membuat transaksi');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingServices) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Customer</Text>

        <Text style={styles.label}>Nama Customer</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan nama lengkap"
          value={customerName}
          onChangeText={setCustomerName}
          editable={!isLoading}
        />

        <Text style={styles.label}>Nomor Telepon</Text>
        <TextInput
          style={styles.input}
          placeholder="08xxxxxxxxxx"
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="phone-pad"
          editable={!isLoading}
        />

        <Text style={styles.label}>Email (Opsional)</Text>
        <TextInput
          style={styles.input}
          placeholder="customer@email.com"
          value={customerEmail}
          onChangeText={setCustomerEmail}
          keyboardType="email-address"
          editable={!isLoading}
        />

        <Text style={styles.label}>Nomor Polisi (Opsional)</Text>
        <TextInput
          style={styles.input}
          placeholder="BL 1234 ABC"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
          editable={!isLoading}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pilih Layanan</Text>

        <Text style={styles.label}>Layanan</Text>
        {services.length > 0 ? (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedService}
              onValueChange={setSelectedService}
              enabled={!isLoading}
            >
              <Picker.Item label="Pilih layanan..." value="" />
              {services.map((service: any) => (
                <Picker.Item key={service.id} label={service.name} value={service.id} />
              ))}
            </Picker>
          </View>
        ) : (
          <Text style={styles.emptyText}>Tidak ada layanan tersedia</Text>
        )}
      </View>

      <Pressable
        style={[styles.submitButton, isLoading && styles.buttonDisabled]}
        onPress={handleCreateTransaction}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Buat Transaksi</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
