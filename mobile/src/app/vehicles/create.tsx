import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateVehicle } from '../../modules/vehicles/hooks/useVehicles';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { getErrorMessage } from '../../shared/services/api-error';

const schema = z.object({
  customerId: z.string().min(1, 'Pilih pelanggan'),
  plateNumber: z.string().min(3, 'Nomor plat tidak valid').max(12),
  brand: z.string().optional(),
  model: z.string().optional(),
  registrationYear: z.string().optional(),
  engineNumber: z.string().optional(),
  chassisNumber: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateVehicleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ customerId?: string }>();
  const createMutation = useCreateVehicle();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: params.customerId || '',
      plateNumber: '',
      brand: '',
      model: '',
      registrationYear: '',
      engineNumber: '',
      chassisNumber: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const vehicle = await createMutation.mutateAsync({
        customerId: data.customerId,
        plateNumber: data.plateNumber.toUpperCase(),
        brand: data.brand || undefined,
        model: data.model || undefined,
        registrationYear: data.registrationYear ? parseInt(data.registrationYear) : undefined,
        engineNumber: data.engineNumber || undefined,
        chassisNumber: data.chassisNumber || undefined,
      });
      router.replace(`/vehicles/${vehicle.id}` as `/${string}`);
    } catch (err) {
      Alert.alert('Gagal', getErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {!params.customerId && (
          <FormField label="ID Pelanggan *" error={errors.customerId?.message}>
            <Controller
              control={control}
              name="customerId"
              render={({ field }) => (
                <TextInput
                  style={[styles.input, errors.customerId && styles.inputError]}
                  placeholder="ID pelanggan"
                  value={field.value}
                  onChangeText={field.onChange}
                />
              )}
            />
          </FormField>
        )}

        <FormField label="Nomor Plat *" error={errors.plateNumber?.message}>
          <Controller
            control={control}
            name="plateNumber"
            render={({ field }) => (
              <TextInput
                style={[styles.input, errors.plateNumber && styles.inputError]}
                placeholder="B 1234 ABC"
                value={field.value}
                onChangeText={(v) => field.onChange(v.toUpperCase())}
                autoCapitalize="characters"
              />
            )}
          />
        </FormField>

        <FormField label="Merek" error={errors.brand?.message}>
          <Controller
            control={control}
            name="brand"
            render={({ field }) => (
              <TextInput
                style={styles.input}
                placeholder="Honda, Yamaha, Toyota..."
                value={field.value}
                onChangeText={field.onChange}
                autoCapitalize="words"
              />
            )}
          />
        </FormField>

        <FormField label="Model / Tipe" error={errors.model?.message}>
          <Controller
            control={control}
            name="model"
            render={({ field }) => (
              <TextInput
                style={styles.input}
                placeholder="Beat, Vario, Avanza..."
                value={field.value}
                onChangeText={field.onChange}
                autoCapitalize="words"
              />
            )}
          />
        </FormField>

        <FormField label="Tahun Registrasi">
          <Controller
            control={control}
            name="registrationYear"
            render={({ field }) => (
              <TextInput
                style={styles.input}
                placeholder="2020"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="numeric"
                maxLength={4}
              />
            )}
          />
        </FormField>

        <FormField label="Nomor Mesin">
          <Controller
            control={control}
            name="engineNumber"
            render={({ field }) => (
              <TextInput
                style={styles.input}
                placeholder="Opsional"
                value={field.value}
                onChangeText={field.onChange}
                autoCapitalize="characters"
              />
            )}
          />
        </FormField>

        <FormField label="Nomor Rangka">
          <Controller
            control={control}
            name="chassisNumber"
            render={({ field }) => (
              <TextInput
                style={styles.input}
                placeholder="Opsional"
                value={field.value}
                onChangeText={field.onChange}
                autoCapitalize="characters"
              />
            )}
          />
        </FormField>

        <Pressable
          style={[styles.submitBtn, createMutation.isPending && styles.btnDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Simpan Kendaraan</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.lg },
  field: { marginBottom: Spacing.md },
  label: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  inputError: { borderColor: Colors.danger },
  errorText: { ...Typography.caption, color: Colors.danger, marginTop: 4 },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
