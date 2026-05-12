import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin logout?', [
      {
        text: 'Batal',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: () => {
          logout();
          router.replace('/');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account" size={48} color="#007AFF" />
        </View>
        <Text style={styles.nameText}>{user?.name || 'User'}</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Bureau</Text>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="email" size={20} color="#999" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="phone" size={20} color="#999" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Nomor Telepon</Text>
            <Text style={styles.infoValue}>{user?.phone || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="badge-account" size={20} color="#999" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>{user?.role}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pengaturan Aplikasi</Text>

        <Pressable style={styles.settingItem}>
          <MaterialCommunityIcons name="palette" size={20} color="#007AFF" />
          <Text style={styles.settingText}>Tema Aplikasi</Text>
          <Text style={styles.settingValue}>Light</Text>
        </Pressable>

        <Pressable style={styles.settingItem}>
          <MaterialCommunityIcons name="bell" size={20} color="#FF9800" />
          <Text style={styles.settingText}>Notifikasi</Text>
          <Text style={styles.settingValue}>Aktif</Text>
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="white" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>

      <Text style={styles.versionText}>Versi 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: '#007AFF',
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    padding: 12,
    marginBottom: 12,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  emailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 12,
    color: '#999',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
});
