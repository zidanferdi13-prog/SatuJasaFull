import client from '../../../api/client';
import { AdminKpis } from '../../../shared/types';

export const dashboardService = {
  getAdminKpis: async (): Promise<AdminKpis> => {
    const { data } = await client.get('/admin/dashboard');
    return data;
  },
};
