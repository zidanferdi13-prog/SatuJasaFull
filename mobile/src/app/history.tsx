import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTransactions } from '../modules/transactions/hooks/useTransactions';
import { TransactionCard } from '../shared/components/TransactionCard';
import { LoadingState } from '../shared/components/LoadingState';
import { EmptyState } from '../shared/components/EmptyState';
import { ErrorState } from '../shared/components/ErrorState';
import { Transaction } from '../shared/types';

export default function HistoryScreen() {
  const { data: transactions, isLoading, isError, refetch, isRefetching } = useTransactions();

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="Gagal memuat transaksi" onRetry={() => refetch()} />;

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item: Transaction) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
      ListEmptyComponent={<EmptyState message="Belum ada transaksi" description="Buat transaksi baru untuk memulai" />}
      renderItem={({ item }: { item: Transaction }) => (
        <TransactionCard
          invoiceNumber={item.invoiceNumber}
          customerName={item.customer?.name || '-'}
          plateNumber={item.items?.[0]?.vehicle?.plateNumber}
          status={item.status}
          amount={item.finalTotal || item.estimatedTotal || 0}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, flexGrow: 1 },
});
