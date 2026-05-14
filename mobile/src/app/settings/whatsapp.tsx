import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { useTenant, useUpdateTenant } from '@/modules/settings/hooks/useSettings';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '@/theme';
import { getErrorMessage } from '@/shared/services/api-error';

const EXAMPLE_TEMPLATE = `Halo {customerName},

Kendaraan Anda ({plateNumber}) telah selesai diproses di layanan STNK kami.

Silakan lacak status di: {trackingUrl}

Terima kasih telah mempercayakan kami!`;

export default function WhatsAppTemplateScreen() {
  const { data: tenant } = useTenant();
  const updateMutation = useUpdateTenant();
  const [template, setTemplate] = useState('');
  const [initialized, setInitialized] = useState(false);

  React.useEffect(() => {
    if (tenant && !initialized) {
      setTemplate(tenant.whatsappTemplate || EXAMPLE_TEMPLATE);
      setInitialized(true);
    }
  }, [tenant]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ whatsappTemplate: template.trim() });
      Alert.alert('Berhasil', 'Template WhatsApp disimpan');
    } catch (err) {
      Alert.alert('Gagal', getErrorMessage(err));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Template Pesan WhatsApp</Text>
        <Text style={styles.hint}>
          Variabel yang tersedia: {'{customerName}'}, {'{plateNumber}'}, {'{trackingUrl}'}, {'{invoiceNumber}'}
        </Text>
        <TextInput
          style={styles.textarea}
          value={template}
          onChangeText={setTemplate}
          multiline
          numberOfLines={12}
          placeholder={EXAMPLE_TEMPLATE}
          textAlignVertical="top"
        />
        <Pressable
          style={[styles.saveBtn, updateMutation.isPending && styles.btnDisabled]}
          onPress={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Simpan Template</Text>}
        </Pressable>
      </View>

      <View style={[styles.infoCard]}>
        <Text style={styles.infoTitle}>Cara Penggunaan</Text>
        <Text style={styles.infoText}>
          Template ini akan digunakan untuk mengirim notifikasi WhatsApp kepada pelanggan ketika status STNK mereka diperbarui.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, gap: Spacing.sm },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.sm },
  sectionTitle: { ...Typography.h4, color: Colors.text },
  hint: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 18 },
  textarea: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: 14, color: Colors.text, backgroundColor: Colors.background,
    minHeight: 200, fontFamily: 'monospace',
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 14, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  infoCard: {
    backgroundColor: Colors.info + '15', borderRadius: BorderRadius.md,
    padding: Spacing.md, gap: Spacing.xs,
  },
  infoTitle: { ...Typography.body, fontWeight: '700', color: Colors.info },
  infoText: { ...Typography.bodySmall, color: Colors.info, lineHeight: 20 },
});
