import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/transaction.service';

export function useTransactions() {
  return useQuery({
    queryKey: ['admin-transactions'],
    queryFn: transactionService.list,
    staleTime: 30_000,
  });
}
