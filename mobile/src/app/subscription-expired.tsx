import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { Colors, Spacing, Typography } from '../theme';

export default function SubscriptionExpiredScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const setSubscriptionExpired = useAuthStore((s) => s.setSubscriptionExpired);

  const handleLogout = async () => {
    setSubscriptionExpired(false);
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="warning-outline" size={72} color={Colors.warning} />
      </View>

      <Text style={styles.title}>Langganan Kadaluarsa</Text>
      <Text style={styles.message}>
        Masa langganan akun biro jasa Anda telah berakhir.{'\n\n'}
        Untuk melanjutkan penggunaan aplikasi, hubungi admin platform STNK Bureau
        untuk memperpanjang langganan Anda.
      </Text>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
        <Text style={styles.infoText}>
          Data transaksi Anda tetap tersimpan dan dapat diakses setelah berlangganan kembali.
        </Text>
      </View>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Kembali ke Login</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  iconContainer: {
    backgroundColor: Colors.warningLight,
    borderRadius: 60,
    padding: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.infoLight,
    borderRadius: 10,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
    alignItems: 'flex-start',
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.info,
    flex: 1,
    lineHeight: 18,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
