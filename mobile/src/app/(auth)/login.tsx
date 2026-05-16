import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../modules/auth/services/auth.service';
import { Colors, Spacing, Shadow, BorderRadius } from '../../theme';
import { getErrorMessage } from '../../shared/services/api-error';

const SUPPORT_WHATSAPP_URL = 'https://wa.me/6281319535441';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Perhatian', 'Email dan password tidak boleh kosong');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login({ email: email.trim(), password });
      await setTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
      router.replace('/(tabs)/dashboard');
    } catch (err) {
      Alert.alert('Login Gagal', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroGlow} />

        <View style={styles.headerCard}>
          <View style={styles.logoWrap}>
            <Image source={require('../../../assets/icon.png')} style={styles.logoImage} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.logoText}>SatuJasa</Text>
            <Text style={styles.tagline}>Operasional biro jasa STNK dalam satu aplikasi.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.kicker}>Welcome Back</Text>
            <Text style={styles.title}>Masuk ke Akun</Text>
            <Text style={styles.subtitle}>Kelola transaksi, tracking, pelanggan, dan layanan dengan cepat.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={19} color={Colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="admin@example.com"
                placeholderTextColor={Colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={19} color={Colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan password"
                placeholderTextColor={Colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>
          </View>

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Masuk</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.helpBox}>
          <Text style={styles.helpText}>Need Help?</Text>
          <Pressable style={styles.helpLinkWrap} onPress={() => Linking.openURL(SUPPORT_WHATSAPP_URL)}>
            <Ionicons name="logo-whatsapp" size={15} color={Colors.primaryDark} />
            <Text style={styles.helpLink}>Contact Me</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  heroGlow: {
    position: 'absolute',
    top: -140,
    alignSelf: 'center',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: Colors.primaryLight,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primaryDark,
    borderWidth: 1,
    borderColor: '#C3C6D6',
    ...Shadow.md,
  },
  logoWrap: {
    width: 66,
    height: 66,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
  },
  logoImage: {
    width: 54,
    height: 54,
    borderRadius: 18,
  },
  headerTextWrap: { flex: 1 },
  logoText: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.8,
  },
  tagline: {
    marginTop: Spacing.xs,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: '#C3C6D6',
    ...Shadow.md,
  },
  cardHeader: { marginBottom: Spacing.xl },
  kicker: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.primaryDark,
  },
  title: {
    marginTop: Spacing.xs,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.7,
  },
  subtitle: {
    marginTop: Spacing.sm,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#C3C6D6',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceMuted,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    marginTop: Spacing.sm,
    ...Shadow.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
  },
  helpText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    fontWeight: '700',
  },
  helpLinkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
  },
  helpLink: {
    fontSize: 13,
    color: Colors.primaryDark,
    fontWeight: '900',
    textAlign: 'center',
  },
});
