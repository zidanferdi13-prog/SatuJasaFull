import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useLogin } from '../modules/auth/hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('owner-biro-jasa-stnk-jakarta-pusat@stnkbureau.local');
  const [password, setPassword] = useState('password123456');
  const loginMutation = useLogin();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password tidak boleh kosong');
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => router.replace('/home'),
        onError: (error: any) => {
          Alert.alert('Login Gagal', error.response?.data?.error || 'Terjadi kesalahan');
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>STNK Bureau</Text>
        <Text style={styles.subtitle}>Bureau Agent App</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan email"
          value={email}
          onChangeText={setEmail}
          editable={!loginMutation.isPending}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loginMutation.isPending}
        />

        <Pressable
          style={[styles.button, loginMutation.isPending && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loginMutation.isPending}
        >
          <Text style={styles.buttonText}>{loginMutation.isPending ? 'Loading...' : 'Login'}</Text>
        </Pressable>

        <Text style={styles.note}>
          Test User: owner-biro-jasa-stnk-jakarta-pusat@stnkbureau.local / password123456
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});
