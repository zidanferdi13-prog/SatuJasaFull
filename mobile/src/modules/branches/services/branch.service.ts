import api from '../../../shared/services/api';
import { Branch } from '../../../shared/types';

export const branchService = {
  list: async (): Promise<Branch[]> => {
    const { data } = await api.get('/branches');
    return data;
  },

  create: async (payload: { name: string; address?: string; phone?: string }): Promise<Branch> => {
    const { data } = await api.post('/branches', payload);
    return data;
  },
};