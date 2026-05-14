import apiClient from '../../../shared/services/api-client';
import { ApiResponse, Transaction, Payment, PaginatedMeta, TransactionStatus } from '../../../shared/types';

export interface TransactionListResult {
  transactions: Transaction[];
  meta?: PaginatedMeta;
}

export interface CreateTransactionPayload {
  customerId: string;
  branchId?: string;
  /** API field name: price (not estimatedPrice) per POST /transactions contract */
  items: { vehicleId: string; serviceTypeId: string; price: number }[];
  dpAmount?: number;
  estimatedFinishDate?: string;
  notes?: string;
}

/** API contract: POST /transactions/:id/finalize only accepts finalTotal + optional notes */
export interface FinalizePayload {
  finalTotal: number;
  notes?: string;
}

export const transactionService = {
  list: async (params?: {
    search?: string;
    status?: TransactionStatus;
    branchId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<TransactionListResult> => {
    const { data } = await apiClient.get<ApiResponse<Transaction[]>>('/transactions', { params });
    return { transactions: data.data || [], meta: data.meta };
  },

  getById: async (id: string): Promise<Transaction> => {
    const { data } = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return data.data;
  },

  create: async (payload: CreateTransactionPayload): Promise<Transaction> => {
    const { data } = await apiClient.post<ApiResponse<Transaction>>('/transactions', payload);
    return data.data;
  },

  updateStatus: async (id: string, status: TransactionStatus, notes?: string): Promise<Transaction> => {
    const { data } = await apiClient.patch<ApiResponse<Transaction>>(`/transactions/${id}/status`, { status, notes });
    return data.data;
  },

  finalize: async (id: string, payload: FinalizePayload): Promise<Transaction> => {
    // API only accepts { finalTotal, notes } — extra fields are ignored but we send only what's specified
    const { data } = await apiClient.post<ApiResponse<Transaction>>(`/transactions/${id}/finalize`, {
      finalTotal: payload.finalTotal,
      notes: payload.notes,
    });
    return data.data;
  },

  close: async (id: string): Promise<Transaction> => {
    const { data } = await apiClient.post<ApiResponse<Transaction>>(`/transactions/${id}/close`);
    return data.data;
  },

  getInvoiceUrl: (id: string): string => `/transactions/${id}/invoice`,

  getPayments: async (id: string): Promise<Payment[]> => {
    const { data } = await apiClient.get<ApiResponse<Payment[]>>(`/transactions/${id}/payments`);
    return data.data || [];
  },

  addPayment: async (id: string, payload: { type: string; method: string; amount: number; notes?: string }): Promise<Payment> => {
    const { data } = await apiClient.post<ApiResponse<Payment>>(`/transactions/${id}/payments`, payload);
    return data.data;
  },
};