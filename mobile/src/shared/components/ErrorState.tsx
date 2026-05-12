import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Spacing, BorderRadii } from '../../theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Terjadi kesalahan', onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={Colors.danger} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Ionicons name="refresh" size={16} color={Colors.surface} />
          <Text style={styles.buttonText}>Coba Lagi</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing['3xl'] },
  message: { marginTop: Spacing.md, fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadii.md },
  buttonText: { color: Colors.surface, fontWeight: '600', marginLeft: Spacing.sm, fontSize: FontSizes.sm },
});