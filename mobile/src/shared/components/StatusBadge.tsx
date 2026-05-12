import { View, Text, StyleSheet } from 'react-native';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { BorderRadii, FontSizes, Spacing } from '../../theme';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] || '#999';
  const label = STATUS_LABELS[status] || status;

  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadii.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  text: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
});