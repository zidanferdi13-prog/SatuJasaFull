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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useVehicle, useUpdateVehicle } from '../../../modules/vehicles/hooks/useVehicles';
import { Colors, Spacing, Typography, BorderRadius } from '../../../theme';
import { getErrorMessage } from '../../../shared/services/api-error';

const schema = z.object({
  plateNumber: z.string().min(3, 'Nomor plat tidak valid').max(12),
  brand: z.string().optional(),
  model: z.string().optional(),
  registrationYear: z.string().optional(),
  engineNumber: z.string().optional(),
  chassisNumber: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditVehicleScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = String(params.id ?? '');
  const router = useRouter();
  const { data: vehicle } = useVehicle(id);
  const updateMutation = useUpdateVehicle(id);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      plateNumber: vehicle?.plateNumber || '',
      brand: vehicle?.brand || '',
      model: vehicle?.model || '',
      registrationYear: vehicle?.registrationYear?.toString() || '',
      engineNumber: vehicle?.engineNumber || '',
      chassisNumber: vehicle?.chassisNumber || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateMutation.mutateAsync({
        plateNumber: data.plateNumber.toUpperCase(),
        brand: data.brand || undefined,
        model: data.model || undefined,
        registrationYear: data.registrationYear ? parseInt(data.registrationYear) : undefined,
        engineNumber: data.engineNumber || undefined,
        chassisNumber: data.chassisNumber || undefined,
      });
      router.back();
    } catch (err) {
      Alert.alert('Gagal', getErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Field label="Nomor Plat *" error={errors.plateNumber?.message}>
          <Controller control={control} name="plateNumber" render={({ field }) => (
            <TextInput
              style={[styles.input, errors.plateNumber && styles.inputError]}
              value={field.value}
              onChangeText={(v) => field.onChange(v.toUpperCase())}
              autoCapitalize="characters"
            />
          )} />
        </Field>
        <Field label="Merek">
          <Controller control={control} name="brand" render={({ field }) => (
            <TextInput style={styles.input} value={field.value} onChangeText={field.onChange} autoCapitalize="words" />
          )} />
        </Field>
        <Field label="Model / Tipe">
          <Controller control={control} name="model" render={({ field }) => (
            <TextInput style={styles.input} value={field.value} onChangeText={field.onChange} autoCapitalize="words" />
          )} />
        </Field>
        <Field label="Tahun Registrasi">
          <Controller control={control} name="registrationYear" render={({ field }) => (
            <TextInput style={styles.input} value={field.value} onChangeText={field.onChange} keyboardType="numeric" maxLength={4} />
          )} />
        </Field>
        <Field label="Nomor Mesin">
          <Controller control={control} name="engineNumber" render={({ field }) => (
            <TextInput style={styles.input} value={field.value} onChangeText={field.onChange} autoCapitalize="characters" />
          )} />
        </Field>
        <Field label="Nomor Rangka">
          <Controller control={control} name="chassisNumber" render={({ field }) => (
            <TextInput style={styles.input} value={field.value} onChangeText={field.onChange} autoCapitalize="characters" />
          )} />
        </Field>
        <Pressable
          style={[styles.submitBtn, updateMutation.isPending && styles.btnDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Simpan Perubahan</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
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
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: 15, color: Colors.text, backgroundColor: Colors.surface,
  },
  inputError: { borderColor: Colors.danger },
  errorText: { ...Typography.caption, color: Colors.danger, marginTop: 4 },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.md,
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
