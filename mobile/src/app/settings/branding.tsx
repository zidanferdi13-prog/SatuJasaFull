import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTenant, useUpdateTenant, useUploadLogo } from '@/modules/settings/hooks/useSettings';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '@/theme';
import { getErrorMessage } from '@/shared/services/api-error';

export default function BrandingScreen() {
  const { data: tenant } = useTenant();
  const updateMutation = useUpdateTenant();
  const uploadMutation = useUploadLogo();
  const [name, setName] = useState('');
  const [edited, setEdited] = useState(false);

  React.useEffect(() => {
    if (tenant && !edited) setName(tenant.name || '');
  }, [tenant]);

  const handleSaveName = async () => {
    try {
      await updateMutation.mutateAsync({ name: name.trim() });
      Alert.alert('Berhasil', 'Nama bisnis diperbarui');
    } catch (err) {
      Alert.alert('Gagal', getErrorMessage(err));
    }
  };

  const handlePickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      try {
        await uploadMutation.mutateAsync(result.assets[0].uri);
        Alert.alert('Berhasil', 'Logo berhasil diperbarui');
      } catch (err) {
        Alert.alert('Gagal', getErrorMessage(err));
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.logoSection, Shadow.sm]}>
        <Pressable style={styles.logoContainer} onPress={handlePickLogo} disabled={uploadMutation.isPending}>
          {tenant?.logoUrl ? (
            <Image source={{ uri: tenant.logoUrl }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="business-outline" size={40} color={Colors.textLight} />
            </View>
          )}
          <View style={styles.editBadge}>
            {uploadMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera" size={14} color="#fff" />
            )}
          </View>
        </Pressable>
        <Text style={styles.logoHint}>Ketuk untuk ganti logo (JPG/PNG)</Text>
      </View>

      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.label}>Nama Bisnis</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(v) => { setName(v); setEdited(true); }}
          placeholder="Nama bisnis Anda"
          autoCapitalize="words"
        />
        <Pressable
          style={[styles.saveBtn, updateMutation.isPending && styles.btnDisabled]}
          onPress={handleSaveName}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Simpan</Text>}
        </Pressable>
      </View>

      {tenant?.subdomain && (
        <View style={[styles.card, Shadow.sm]}>
          <Text style={styles.label}>Subdomain</Text>
          <Text style={styles.subdomainValue}>{tenant.subdomain}.jasaku.app</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, gap: Spacing.sm },
  logoSection: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.md,
  },
  logoContainer: { position: 'relative' },
  logo: { width: 100, height: 100, borderRadius: 50 },
  logoPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surface,
  },
  logoHint: { ...Typography.caption, color: Colors.textSecondary },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md },
  label: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: 15, color: Colors.text, backgroundColor: Colors.background,
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 12, alignItems: 'center', marginTop: Spacing.md,
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  subdomainValue: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
});
