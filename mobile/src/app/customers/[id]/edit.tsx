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
import { useCustomer, useUpdateCustomer } from '../../../modules/customers/hooks/useCustomers';
import { Colors, Spacing, Typography, BorderRadius } from '../../../theme';
import { getErrorMessage } from '../../../shared/services/api-error';

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().min(9, 'Nomor HP tidak valid').max(15),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditCustomerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: customer } = useCustomer(id);
  const updateMutation = useUpdateCustomer(id);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      name: customer?.name || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      address: customer?.address || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateMutation.mutateAsync({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
      });
      router.back();
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
        <FormField label="Nama Lengkap *" error={errors.name?.message}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={field.value}
                onChangeText={field.onChange}
                autoCapitalize="words"
              />
            )}
          />
        </FormField>

        <FormField label="Nomor HP *" error={errors.phone?.message}>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="phone-pad"
              />
            )}
          />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
        </FormField>

        <FormField label="Alamat" error={errors.address?.message}>
          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <TextInput
                style={[styles.input, styles.textarea]}
                value={field.value}
                onChangeText={field.onChange}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </FormField>

        <Pressable
          style={[styles.submitBtn, updateMutation.isPending && styles.btnDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Simpan Perubahan</Text>
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
  textarea: { height: 80, textAlignVertical: 'top' },
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
