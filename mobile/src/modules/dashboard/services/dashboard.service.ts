import api from '../../../shared/services/api';
import { DashboardKpis } from '../../../shared/types';

export const dashboardService = {
  getKpis: async (): Promise<DashboardKpis> => {
    const { data } = await api.get('/dashboard/kpis');
    return data;
  },
};