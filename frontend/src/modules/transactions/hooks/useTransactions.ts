import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService, TransactionFilters, CreateTransactionDTO } from '../services/transaction.service';
import { TransactionStatus } from '../../../shared/types';

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionService.list(filters),
    staleTime: 30_000,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionDTO) => transactionService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: TransactionStatus; notes?: string }) =>
      transactionService.updateStatus(id, status, notes),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', vars.id] });
    },
  });
}
