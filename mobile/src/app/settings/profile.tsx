import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '@/theme';
import { ROLES } from '@/shared/constants';

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user } = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || '-'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{ROLES[user?.role as keyof typeof ROLES] || user?.role}</Text>
        </View>
      </View>

      <View style={[styles.card, Shadow.sm]}>
        <Text style={styles.sectionTitle}>Informasi Akun</Text>
        <InfoRow label="Nama" value={user?.name} />
        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Nomor HP" value={user?.phone} />
        <InfoRow label="Role" value={ROLES[user?.role as keyof typeof ROLES] || user?.role} />
      </View>

      {user?.tenant && (
        <View style={[styles.card, Shadow.sm]}>
          <Text style={styles.sectionTitle}>Informasi Tenant</Text>
          <InfoRow label="Nama Bisnis" value={user.tenant.name} />
          <InfoRow label="Subdomain" value={user.tenant.subdomain} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  avatarCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { ...Typography.h2, color: Colors.text, marginBottom: Spacing.xs },
  roleBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.md, paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  roleText: { color: Colors.primary, fontWeight: '600', fontSize: 12 },
  card: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  sectionTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.sm },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  rowLabel: { ...Typography.body, color: Colors.textSecondary },
  rowValue: { ...Typography.body, color: Colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },
});
