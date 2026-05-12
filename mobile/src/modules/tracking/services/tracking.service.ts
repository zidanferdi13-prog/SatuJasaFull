import api from '../../../shared/services/api';

export const trackingService = {
  getByToken: async (token: string) => {
    const { data } = await api.get(`/tracking/${token}`);
    return data;
  },
};