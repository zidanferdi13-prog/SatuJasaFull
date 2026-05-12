import client from '../../../api/client';
import { Transaction } from '../../../shared/types';

export const transactionService = {
  list: async (): Promise<Transaction[]> => {
    const { data } = await client.get('/transactions');
    return data;
  },
};
