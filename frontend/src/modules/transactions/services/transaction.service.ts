import api from '../../../shared/services/api';
import { Transaction } from '../../../shared/types';

export const transactionService = {
  list: async (): Promise<Transaction[]> => {
    const { data } = await api.get('/transactions');
    return data;
  },
};
