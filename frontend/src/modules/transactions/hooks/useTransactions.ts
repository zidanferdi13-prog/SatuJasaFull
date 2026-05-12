import { useQuery } from 'react-query';
import { transactionService } from '../services/transaction.service';

export function useTransactions() {
  return useQuery('admin-transactions', transactionService.list, {
    staleTime: 30_000,
  });
}
