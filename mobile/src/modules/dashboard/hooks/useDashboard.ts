import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export function useDashboardKpis() {
  return useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => dashboardService.getTenantDashboard(),
    refetchInterval: 30_000,
  });
}

export function useRevenueSummary(params?: { branchId?: string; month?: string }) {
  return useQuery({
    queryKey: ['revenue-summary', params],
    queryFn: () => dashboardService.getRevenueSummary(params),
    staleTime: 1000 * 60 * 5,
  });
}
