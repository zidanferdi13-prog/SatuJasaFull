import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTransaction, useUpdateTransactionStatus } from '../../../modules/transactions/hooks/useTransactions';
import { STATUS_LABELS, STATUS_TRANSITION } from '../../../shared/constants';
import { TransactionStatus } from '../../../shared/types';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '../../../theme';
import { getErrorMessage } from '../../../shared/services/api-error';

export default function UpdateStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: transaction } = useTransaction(id);
  const updateMutation = useUpdateTransactionStatus(id);
  const [notes, setNotes] = useState('');

  if (!transaction) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  const nextStatus = STATUS_TRANSITION[transaction.status] as TransactionStatus | undefined;
  if (!nextStatus) {
    return (
      <View style={styles.center}>
        <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
        <Text style={styles.doneText}>Status sudah final</Text>
      </View>
    );
  }

  const handleUpdate = async () => {
    try {
      await updateMutation.mutateAsync({ status: nextStatus, notes: notes.trim() || undefined });
      router.back();
    } catch (err) {
      Alert.alert('Gagal', getErrorMessage(err));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Status Saat Ini</Text>
        <Text style={styles.currentStatus}>
          {STATUS_LABELS[transaction.status]}
        </Text>
      </View>

      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Update ke Status</Text>
        <View style={styles.nextBadge}>
          <Ionicons name="arrow-forward-circle" size={20} color={Colors.primary} />
          <Text style={styles.nextStatus}>{STATUS_LABELS[nextStatus]}</Text>
        </View>
      </View>

      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.label}>Catatan (opsional)</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Tambahkan catatan..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      <Pressable
        style={[styles.submitBtn, updateMutation.isPending && styles.btnDisabled]}
        onPress={handleUpdate}
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>
            Update ke {STATUS_LABELS[nextStatus]}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md, gap: Spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  doneText: { ...Typography.h3, color: Colors.success },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  sectionTitle: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.xs },
  currentStatus: { ...Typography.h3, color: Colors.text },
  nextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  nextStatus: { ...Typography.h3, color: Colors.primary },
  label: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' },
  textarea: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.background,
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
