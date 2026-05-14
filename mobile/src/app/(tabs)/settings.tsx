import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/modules/auth/services/auth.service';
import { Colors, Spacing, Typography, Shadow, BorderRadius } from '@/theme';

interface MenuItemProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  sublabel?: string;
  onPress: () => void;
  color?: string;
  danger?: boolean;
}

function MenuItem({ icon, label, sublabel, onPress, color, danger }: MenuItemProps) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: (color || Colors.primary) + '15' }]}>
        <Ionicons name={icon} size={20} color={color || Colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && styles.dangerText]}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      {!danger && <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Card */}
      <View style={[styles.profileCard, Shadow.sm]}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profileRole}>{user?.role === 'OWNER' ? 'Pemilik' : 'Admin'}</Text>
          <Text style={styles.profileTenant}>{user?.tenantName || ''}</Text>
        </View>
      </View>

      {/* Menu Groups */}
      <View style={styles.group}>
        <Text style={styles.groupTitle}>Profil & Akun</Text>
        <MenuItem
          icon="person-outline"
          label="Profil Saya"
          onPress={() => router.push('/settings/profile')}
        />
        <MenuItem
          icon="image-outline"
          label="Branding Tenant"
          sublabel="Logo dan informasi bureau"
          onPress={() => router.push('/settings/branding')}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Operasional</Text>
        <MenuItem
          icon="logo-whatsapp"
          label="Template WhatsApp"
          sublabel="Pesan otomatis ke pelanggan"
          color="#25D366"
          onPress={() => router.push('/settings/whatsapp')}
        />
        <MenuItem
          icon="pricetag-outline"
          label="Aturan Harga"
          sublabel="Kelola harga layanan"
          color={Colors.warning}
          onPress={() => router.push('/settings/pricing')}
        />
        <MenuItem
          icon="business-outline"
          label="Cabang"
          sublabel="Kelola cabang biro jasa"
          color={Colors.info}
          onPress={() => router.push('/branches/index')}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Langganan</Text>
        <MenuItem
          icon="card-outline"
          label="Status Langganan"
          sublabel="Lihat info berlangganan"
          color={Colors.success}
          onPress={() => router.push('/settings/subscription')}
        />
      </View>

      <View style={[styles.group, styles.lastGroup]}>
        <MenuItem
          icon="log-out-outline"
          label="Keluar"
          onPress={handleLogout}
          danger
          color={Colors.danger}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { ...Typography.h4, color: Colors.text },
  profileRole: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '600' },
  profileTenant: { ...Typography.bodySmall, color: Colors.textSecondary },
  group: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  lastGroup: { marginBottom: Spacing.xl },
  groupTitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: Spacing.md,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: { flex: 1 },
  menuLabel: { ...Typography.body, color: Colors.text, fontWeight: '500' },
  menuSublabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  dangerText: { color: Colors.danger },
});
