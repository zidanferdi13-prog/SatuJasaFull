import api from '../../../shared/services/api';

export const revenueService = {
  getSummary: async () => {
    const { data } = await api.get('/dashboard/kpis');
    return data;
  },
};