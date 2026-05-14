import api from '../../../shared/services/api-client';

export const subscriptionService = {
  getStatus: async () => {
    const { data } = await api.get('/dashboard/kpis');
    return data;
  },
};