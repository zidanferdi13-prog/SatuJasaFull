import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Spacing } from '../../theme';

interface EmptyStateProps {
  icon?: string;
  message: string;
  description?: string;
}

export function EmptyState({ icon = 'inbox-outline', message, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={48} color={Colors.textLight} />
      <Text style={styles.message}>{message}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  message: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textSecondary, marginTop: Spacing.md },
  description: { fontSize: FontSizes.sm, color: Colors.textLight, marginTop: Spacing.xs, textAlign: 'center' },
});