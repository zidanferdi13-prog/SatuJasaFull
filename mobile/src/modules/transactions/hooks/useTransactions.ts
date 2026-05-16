import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  transactionService,
  CreateTransactionPayload,
  FinalizePayload,
} from '../services/transaction.service';
import { TransactionStatus } from '../../../shared/types';

export function useTransactions(params?: {
  search?: string;
  status?: TransactionStatus;
  branchId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionService.list(params),
    select: (result) => result.transactions,
    staleTime: 30_000,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => transactionService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
}

export function useUpdateTransactionStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ status, notes }: { status: TransactionStatus; notes?: string }) =>
      transactionService.updateStatus(id, status, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['transaction', id] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
}

export function useFinalizeTransaction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FinalizePayload) => transactionService.finalize(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transaction', id] });
    },
  });
}

export function useCloseTransaction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => transactionService.close(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['transaction', id] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
}

export function useTransactionPayments(id: string) {
  return useQuery({
    queryKey: ['transaction-payments', id],
    queryFn: () => transactionService.getPayments(id),
    enabled: !!id,
  });
}

export function useAddPayment(transactionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { type: string; method: string; amount: number; notes?: string }) =>
      transactionService.addPayment(transactionId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transaction-payments', transactionId] });
      qc.invalidateQueries({ queryKey: ['transaction', transactionId] });
    },
  });
}
