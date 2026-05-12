import api from '../../../shared/services/api';
import { Transaction, CreateTransactionDTO } from '../../../shared/types';

export const transactionService = {
  list: async (): Promise<Transaction[]> => {
    const { data } = await api.get('/transactions');
    return data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const { data } = await api.get(`/transactions/${id}`);
    return data;
  },

  create: async (payload: CreateTransactionDTO): Promise<Transaction> => {
    const { data } = await api.post('/transactions', payload);
    return data;
  },

  updateStatus: async (id: string, status: string, notes?: string): Promise<Transaction> => {
    const { data } = await api.patch(`/transactions/${id}/status`, { status, notes });
    return data;
  },
};