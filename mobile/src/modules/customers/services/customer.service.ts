import api from '../../../shared/services/api';
import { Customer } from '../../../shared/types';

export const customerService = {
  list: async (): Promise<Customer[]> => {
    const { data } = await api.get('/customers');
    return data;
  },

  search: async (q: string): Promise<Customer[]> => {
    const { data } = await api.get('/customers/search', { params: { q } });
    return data;
  },

  create: async (payload: { name: string; phone: string; email?: string; address?: string }): Promise<Customer> => {
    const { data } = await api.post('/customers', payload);
    return data;
  },
};