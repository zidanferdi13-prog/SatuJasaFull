import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/modules/auth/services/auth.service';
import { Colors, Spacing, Shadow, BorderRadius } from '@/theme';

interface MenuItemProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  sublabel?: string;
  onPress: () => void;
  color?: string;
}

function MenuItem({ icon, label, sublabel, onPress, color }: MenuItemProps) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={[styles.menuIcon, { backgroundColor: (color || Colors.primary) + '14' }]}>
          <Ionicons name={icon} size={22} color={color || Colors.primary} />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuLabel}>{label}</Text>
          {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.profileCard, Shadow.sm]}>
        <View style={styles.logoWrap}>
          <Image source={require('../../../assets/icon.png')} style={styles.logo} />
          <Pressable style={styles.editLogoBtn} onPress={() => router.push('/settings/branding')}>
            <Ionicons name="create" size={14} color="#fff" />
          </Pressable>
        </View>
        <Text style={styles.profileTenant}>{user?.tenantName || 'Biro Jasa STNK'}</Text>
        <Text style={styles.profileAddress}>{user?.name || 'User'} • {user?.role === 'OWNER' ? 'Pemilik' : 'Admin'}</Text>
      </View>

      <View style={[styles.menuCard, Shadow.sm]}>
        <MenuItem
          icon="person-outline"
          label="Profil Saya"
          sublabel="Kelola data akun pengguna"
          onPress={() => router.push('/settings/profile')}
        />
        <MenuItem
          icon="image-outline"
          label="Branding Tenant"
          sublabel="Logo dan informasi biro"
          onPress={() => router.push('/settings/branding')}
        />
        <MenuItem
          icon="logo-whatsapp"
          label="Template WhatsApp"
          sublabel="Atur pesan otomatis pelanggan"
          color="#25D366"
          onPress={() => router.push('/settings/whatsapp')}
        />
        <MenuItem
          icon="pricetag-outline"
          label="Aturan Harga"
          sublabel="Konfigurasi biaya jasa layanan"
          color={Colors.primary}
          onPress={() => router.push('/settings/pricing')}
        />
        <MenuItem
          icon="card-outline"
          label="Status Berlangganan"
          sublabel="Aktif dan informasi masa layanan"
          color={Colors.success}
          onPress={() => router.push('/settings/subscription')}
        />
      </View>

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <Text style={styles.versionText}>Versi 1.2.0 • Sistem STNK Indonesia</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingTop: Spacing['2xl'], paddingBottom: 96 },
  profileCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#C3C6D6',
    marginBottom: Spacing['2xl'],
  },
  logoWrap: { width: 96, height: 96, marginBottom: Spacing.md },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  editLogoBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  profileTenant: { fontSize: 20, lineHeight: 28, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  profileAddress: { fontSize: 14, lineHeight: 20, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  menuCard: {
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#C3C6D6',
    overflow: 'hidden',
  },
  menuItem: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15, lineHeight: 22, color: Colors.text, fontWeight: '800' },
  menuSublabel: { fontSize: 12, lineHeight: 16, color: Colors.textSecondary, marginTop: 2 },
  logoutBtn: {
    marginTop: Spacing['2xl'],
    minHeight: 54,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.dangerLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FFD1D1',
  },
  logoutText: { fontSize: 15, lineHeight: 22, color: Colors.danger, fontWeight: '800' },
  versionText: { marginTop: Spacing.md, textAlign: 'center', fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
});
