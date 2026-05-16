import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTenant, useUpdateTenant } from '@/modules/settings/hooks/useSettings';
import { Colors, Spacing, Shadow, BorderRadius } from '@/theme';
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
      <View style={[styles.heroCard, Shadow.sm]}>
        <View>
          <Text style={styles.eyebrow}>WhatsApp Automation</Text>
          <Text style={styles.pageTitle}>Template Pesan</Text>
          <Text style={styles.pageSubtitle}>Atur kalimat yang dikirim saat status STNK pelanggan diperbarui.</Text>
        </View>
        <View style={styles.heroIcon}>
          <Ionicons name="logo-whatsapp" size={25} color="#128C7E" />
        </View>
      </View>

      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Template Pesan WhatsApp</Text>
        <View style={styles.tokenWrap}>
          {['{customerName}', '{plateNumber}', '{trackingUrl}', '{invoiceNumber}'].map((token) => (
            <Text key={token} style={styles.token}>{token}</Text>
          ))}
        </View>
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

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={22} color={Colors.info} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Cara Penggunaan</Text>
          <Text style={styles.infoText}>
            Template ini dipakai untuk notifikasi WhatsApp pelanggan ketika status STNK mereka diperbarui.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingTop: Spacing['2xl'], paddingBottom: 96, gap: Spacing.md },
  heroCard: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: '#C3C6D6' },
  heroIcon: { width: 48, height: 48, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3FFF1' },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase', color: '#128C7E', marginBottom: 4 },
  pageTitle: { fontSize: 30, lineHeight: 36, fontWeight: '900', color: Colors.text, letterSpacing: -0.7 },
  pageSubtitle: { maxWidth: 250, fontSize: 14, lineHeight: 20, color: Colors.textSecondary, marginTop: Spacing.xs },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.md, borderWidth: 1, borderColor: '#C3C6D6' },
  sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '900', color: Colors.text },
  tokenWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  token: { paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryLight, color: Colors.primaryDark, fontSize: 11, fontWeight: '900' },
  textarea: { borderWidth: 1, borderColor: '#C3C6D6', borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: 14, lineHeight: 20, color: Colors.text, backgroundColor: Colors.surfaceMuted, minHeight: 220, fontFamily: 'monospace' },
  saveBtn: { backgroundColor: Colors.primaryDark, borderRadius: BorderRadius.lg, paddingVertical: 15, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  infoCard: { flexDirection: 'row', backgroundColor: Colors.infoLight, borderRadius: BorderRadius.xl, padding: Spacing.md, gap: Spacing.sm, borderWidth: 1, borderColor: '#BAE6FD' },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '900', color: Colors.info },
  infoText: { fontSize: 13, lineHeight: 19, color: Colors.info, marginTop: 2 },
});
