import api from '../../../shared/services/api-client';

export const trackingService = {
  getByToken: async (token: string) => {
    const { data } = await api.get(`/tracking/${token}`);
    return data;
  },
};