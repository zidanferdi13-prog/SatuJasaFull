import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { useAuthStore } from '../../../store/authStore';

export function useDashboardKpis() {
  const selectedBranch = useAuthStore((s) => s.selectedBranch);

  return useQuery({
    queryKey: ['dashboard-kpis', selectedBranch?.id],
    queryFn: () =>
      selectedBranch
        ? dashboardService.getBranchDashboard(selectedBranch.id)
        : dashboardService.getTenantDashboard(),
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
