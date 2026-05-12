import api from '../../../shared/services/api';

export const subscriptionService = {
  getStatus: async () => {
    const { data } = await api.get('/dashboard/kpis');
    return data;
  },
};