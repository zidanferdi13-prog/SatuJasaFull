import api from '../../../shared/services/api';
import { AdminKpis } from '../../../shared/types';

export const dashboardService = {
  getAdminKpis: async (): Promise<AdminKpis> => {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },
};
