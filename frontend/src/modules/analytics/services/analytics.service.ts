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

export interface RevenueExportSummary {
  totalRevenue: number;
  totalDp: number;
  totalRefund: number;
  transactionCount: number;
}

export const analyticsService = {
  // Revenue summary — GET /exports/revenue
  getRevenueSummary: (filters?: AnalyticsFilters): Promise<RevenueExportSummary> =>
    api
      .get('/exports/revenue', {
        params: {
          start_date: filters?.startDate,
          end_date: filters?.endDate,
          tenant_id: filters?.tenantId,
        },
      })
      .then((r) => r.data.data),

  // Admin KPI snapshot — GET /dashboard/admin
  getAdminSnapshot: () =>
    api.get('/dashboard/admin').then((r) => r.data.data),

  // Tenant KPI snapshot — GET /dashboard/tenant
  getTenantSnapshot: () =>
    api.get('/dashboard/tenant').then((r) => r.data.data),

  // Branch KPI — GET /dashboard/branch/:branchId
  getBranchKpis: (branchId: string) =>
    api.get(`/dashboard/branch/${branchId}`).then((r) => r.data.data),
};
