import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing } from '../../theme';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Memuat...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing['3xl'] },
  text: { marginTop: Spacing.md, fontSize: FontSizes.md, color: Colors.textSecondary },
});