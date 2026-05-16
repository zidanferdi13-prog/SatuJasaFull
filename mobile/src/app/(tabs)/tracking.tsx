import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/shared/services/api-client';
import { ApiResponse, Transaction } from '@/shared/types';
import { TRACKING_URL } from '@/shared/constants';
import { Colors, Spacing, Shadow, BorderRadius } from '@/theme';
import { getErrorMessage } from '@/shared/services/api-error';
import { STATUS_COLORS, STATUS_LABELS } from '@/shared/constants';

export default function TrackingScreen() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Transaction>>('/tracking/search', {
        params: { q: query.trim() },
      });
      setResult(data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSearching(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    const trackingLink = `${TRACKING_URL}/${result.trackingCode}`;
    try {
      await Share.share({
        message: `Lacak status kendaraan Anda di:\n${trackingLink}\n\nKode Tracking: ${result.trackingCode}`,
        url: trackingLink,
      });
    } catch {
      Alert.alert('Gagal berbagi', 'Tidak dapat membuka share dialog.');
    }
  };

  const statusColor = result ? STATUS_COLORS[result.status] : Colors.textLight;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={[styles.searchCard, Shadow.sm]}>
        <View style={styles.searchHeader}>
          <View>
            <Text style={styles.eyebrow}>Tracking Desk</Text>
            <Text style={styles.title}>Cari Berkas</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="navigate-outline" size={24} color={Colors.primaryDark} />
          </View>
        </View>
        <Text style={styles.subtitle}>
          Masukkan kode tracking, invoice, atau plat nomor untuk melihat progres STNK.
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Kode tracking / invoice / plat..."
            value={query}
            onChangeText={setQuery}
            autoCapitalize="characters"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <Pressable
            style={[styles.searchBtn, isSearching && styles.searchBtnDisabled]}
            onPress={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="search" size={22} color="#fff" />
            )}
          </Pressable>
        </View>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={20} color={Colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {result && (
        <View style={[styles.resultCard, Shadow.md]}>
          <View style={styles.resultHero}>
            <View>
              <Text style={styles.invoiceLabel}>Invoice</Text>
              <Text style={styles.invoiceNum}>{result.invoiceNumber}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusColor + '16', borderColor: statusColor + '55' }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>
                {STATUS_LABELS[result.status]}
              </Text>
            </View>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Pelanggan</Text>
            <Text style={styles.resultValue}>{result.customer?.name || '-'}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Status</Text>
            <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>
                {STATUS_LABELS[result.status]}
              </Text>
            </View>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Kode Tracking</Text>
            <Text style={styles.trackingCode}>{result.trackingCode}</Text>
          </View>
          {result.items && result.items.length > 0 && (
            <View style={styles.vehiclesSection}>
              <Text style={styles.vehiclesTitle}>Kendaraan ({result.items.length})</Text>
              {result.items.map((item) => (
                <Text key={item.id} style={styles.vehicleItem}>
                  • {item.vehicle?.plateNumber} — {item.vehicle?.brand} {item.vehicle?.model}
                </Text>
              ))}
            </View>
          )}

          <Pressable style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#fff" />
            <Text style={styles.shareBtnText}>Bagikan Link Tracking</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingTop: Spacing['2xl'], paddingBottom: 104, gap: Spacing.md },
  searchCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: '#C3C6D6' },
  searchHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.sm },
  eyebrow: { fontSize: 12, fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.primaryDark, marginBottom: 4 },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '900', color: Colors.text, letterSpacing: -0.7 },
  subtitle: { fontSize: 14, lineHeight: 20, color: Colors.textSecondary, marginBottom: Spacing.lg },
  headerIcon: { width: 48, height: 48, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  input: { flex: 1, borderWidth: 1, borderColor: '#C3C6D6', borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: 13, fontSize: 15, color: Colors.text, backgroundColor: Colors.surface },
  searchBtn: { backgroundColor: Colors.primaryDark, borderRadius: BorderRadius.lg, width: 50, alignItems: 'center', justifyContent: 'center' },
  searchBtnDisabled: { opacity: 0.6 },
  errorBox: { flexDirection: 'row', backgroundColor: Colors.dangerLight, borderRadius: BorderRadius.xl, padding: Spacing.md, gap: Spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: '#FFB4AB' },
  errorText: { fontSize: 14, lineHeight: 20, color: Colors.danger, flex: 1, fontWeight: '700' },
  resultCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.sm, borderWidth: 1, borderColor: '#C3C6D6' },
  resultHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.md, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  invoiceLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', color: Colors.textSecondary },
  invoiceNum: { fontSize: 24, lineHeight: 30, fontWeight: '900', color: Colors.text, letterSpacing: -0.4 },
  resultLabel: { fontSize: 13, lineHeight: 18, fontWeight: '800', color: Colors.textSecondary },
  resultValue: { flex: 1, textAlign: 'right', fontSize: 14, lineHeight: 20, color: Colors.text, fontWeight: '800' },
  badge: { borderWidth: 1, paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  trackingCode: { fontSize: 14, lineHeight: 20, color: Colors.primaryDark, fontWeight: '900', letterSpacing: 1.2 },
  vehiclesSection: { marginTop: Spacing.sm, backgroundColor: Colors.surfaceMuted, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.divider },
  vehiclesTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', color: Colors.textSecondary, marginBottom: Spacing.sm },
  vehicleItem: { fontSize: 14, lineHeight: 20, color: Colors.text, marginBottom: 4, fontWeight: '700' },
  shareBtn: { flexDirection: 'row', backgroundColor: Colors.primaryDark, borderRadius: BorderRadius.lg, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  shareBtnText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
