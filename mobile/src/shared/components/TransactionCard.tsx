import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadii } from '../../theme';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDateShort } from '../utils/format';

interface TransactionCardProps {
  invoiceNumber: string;
  customerName: string;
  plateNumber?: string;
  status: string;
  amount: number;
  onPress?: () => void;
}

export function TransactionCard({ invoiceNumber, customerName, plateNumber, status, amount, onPress }: TransactionCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.invoice}>{invoiceNumber}</Text>
          <Text style={styles.customer}>{customerName}</Text>
        </View>
        <Text style={styles.amount}>{formatCurrency(amount)}</Text>
      </View>
      <View style={styles.footer}>
        {plateNumber ? (
          <View style={styles.plateRow}>
            <Ionicons name="car" size={14} color={Colors.textSecondary} />
            <Text style={styles.plate}>{plateNumber}</Text>
          </View>
        ) : null}
        <StatusBadge status={status} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  headerLeft: { flex: 1, marginRight: Spacing.md },
  invoice: { fontSize: FontSizes.xs, color: Colors.primary, fontFamily: 'monospace', fontWeight: '600' },
  customer: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.text, marginTop: 2 },
  amount: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.text },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plateRow: { flexDirection: 'row', alignItems: 'center' },
  plate: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginLeft: 4 },
});