import api from '../../../shared/services/api';

export interface RevenueData {
  period: string;
  revenue: number;
  transactions: number;
}

export interface BranchRevenue {
  branchId: string;
  branchName: string;
  revenue: number;
  transactions: number;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  tenantId?: string;
}

export const analyticsService = {
  getRevenue: (filters?: AnalyticsFilters): Promise<RevenueData[]> =>
    api.get('/analytics/revenue', { params: filters }).then((r) => r.data.data),

  getBranchRevenue: (filters?: AnalyticsFilters): Promise<BranchRevenue[]> =>
    api.get('/analytics/branches', { params: filters }).then((r) => r.data.data),
};
