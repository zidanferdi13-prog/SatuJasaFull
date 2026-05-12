import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadii } from '../../theme';

interface KpiCardProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  borderColor?: string;
}

export function KpiCard({ icon, iconColor, label, value, borderColor }: KpiCardProps) {
  return (
    <View style={[styles.card, borderColor ? { borderLeftColor: borderColor } : undefined]}>
      <Ionicons name={icon as any} size={28} color={iconColor} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadii.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  value: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
});