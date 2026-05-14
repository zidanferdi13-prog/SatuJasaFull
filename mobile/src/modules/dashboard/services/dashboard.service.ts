import apiClient from '../../../shared/services/api-client';
import { ApiResponse, DashboardKpi, RevenueSummary } from '../../../shared/types';

export const dashboardService = {
  getTenantDashboard: async (): Promise<DashboardKpi> => {
    const { data } = await apiClient.get<ApiResponse<DashboardKpi>>('/dashboard/tenant');
    return data.data;
  },

  getBranchDashboard: async (branchId: string): Promise<DashboardKpi> => {
    const { data } = await apiClient.get<ApiResponse<DashboardKpi>>(`/dashboard/branch/${branchId}`);
    return data.data;
  },

  /** GET /exports/revenue — returns totalRevenue, totalDp, totalRefund, transactionCount */
  getRevenueSummary: async (params?: { branchId?: string; start_date?: string; end_date?: string }): Promise<RevenueSummary> => {
    const { data } = await apiClient.get<ApiResponse<RevenueSummary>>('/exports/revenue', { params });
    return data.data;
  },
};
