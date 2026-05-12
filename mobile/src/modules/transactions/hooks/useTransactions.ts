import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transaction.service';
import { CreateTransactionDTO } from '../../../shared/types';

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: transactionService.list,
    staleTime: 30_000,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionDTO) => transactionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
}

export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      transactionService.updateStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
}