import api from '../../../shared/services/api';
import { AdminKpis, DashboardKpis } from '../../../shared/types';

export const dashboardService = {
  // Super Admin: GET /dashboard/admin
  getAdminKpis: async (): Promise<AdminKpis> => {
    const { data } = await api.get('/dashboard/admin');
    return data.data as AdminKpis;
  },

  // Tenant Admin: GET /dashboard/tenant
  getTenantKpis: async (): Promise<DashboardKpis> => {
    const { data } = await api.get('/dashboard/tenant');
    return data.data as DashboardKpis;
  },

  // Branch: GET /dashboard/branch/:branchId
  getBranchKpis: async (branchId: string): Promise<DashboardKpis> => {
    const { data } = await api.get(`/dashboard/branch/${branchId}`);
    return data.data as DashboardKpis;
  },
};
