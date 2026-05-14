import api from '../../../shared/services/api';
import { Transaction, TransactionStatus } from '../../../shared/types';

export interface TransactionFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: TransactionStatus;
  branchId?: string;
  start_date?: string;
  end_date?: string;
  sort?: string;
}

export interface PaginatedTransactions {
  data: Transaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface CreateTransactionDTO {
  customerId: string;
  branchId?: string;
  estimatedFinishDate?: string;
  notes?: string;
  items: Array<{
    vehicleId: string;
    serviceTypeId: string;
    price: number;
    notes?: string;
  }>;
}

export const transactionService = {
  list: async (filters?: TransactionFilters): Promise<PaginatedTransactions> => {
    const { data } = await api.get('/transactions', { params: filters });
    return { data: data.data, meta: data.meta };
  },

  getById: async (id: string): Promise<Transaction> => {
    const { data } = await api.get(`/transactions/${id}`);
    return data.data as Transaction;
  },

  create: async (payload: CreateTransactionDTO): Promise<Transaction> => {
    const { data } = await api.post('/transactions', payload);
    return data.data as Transaction;
  },

  updateStatus: async (id: string, status: TransactionStatus, notes?: string): Promise<Transaction> => {
    const { data } = await api.patch(`/transactions/${id}/status`, { status, notes });
    return data.data as Transaction;
  },

  finalize: async (id: string, finalTotal: number, notes?: string): Promise<Transaction> => {
    const { data } = await api.post(`/transactions/${id}/finalize`, { finalTotal, notes });
    return data.data as Transaction;
  },

  close: async (id: string): Promise<Transaction> => {
    const { data } = await api.post(`/transactions/${id}/close`);
    return data.data as Transaction;
  },

  getInvoiceUrl: (id: string): string =>
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/transactions/${id}/invoice`,
};
