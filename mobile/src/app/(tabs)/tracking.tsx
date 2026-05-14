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
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '@/theme';
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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.searchCard}>
        <Text style={styles.title}>Cari Tracking</Text>
        <Text style={styles.subtitle}>
          Cari berdasarkan kode tracking, nomor invoice, atau nomor plat
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
          <View style={styles.resultRow}>
            <Text style={styles.invoiceLabel}>Invoice</Text>
            <Text style={styles.invoiceNum}>{result.invoiceNumber}</Text>
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
  searchCard: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  title: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.xs },
  subtitle: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.lg },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnDisabled: { opacity: 0.6 },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: Colors.dangerLight,
    margin: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  errorText: { ...Typography.body, color: Colors.danger, flex: 1 },
  resultCard: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  invoiceLabel: { ...Typography.bodySmall, color: Colors.textSecondary },
  invoiceNum: { ...Typography.h4, color: Colors.text },
  resultLabel: { ...Typography.body, color: Colors.textSecondary },
  resultValue: { ...Typography.body, color: Colors.text, fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  badgeText: { fontSize: 12, fontWeight: '700' },
  trackingCode: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  vehiclesSection: { marginTop: Spacing.xs },
  vehiclesTitle: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '600' },
  vehicleItem: { ...Typography.body, color: Colors.text, marginBottom: 2 },
  shareBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  shareBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
