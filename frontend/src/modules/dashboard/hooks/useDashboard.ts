import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: dashboardService.getAdminKpis,
    refetchInterval: 30_000,
  });
}

export function useTenantDashboard() {
  return useQuery({
    queryKey: ['tenant-dashboard'],
    queryFn: dashboardService.getTenantKpis,
    refetchInterval: 30_000,
  });
}

export function useBranchDashboard(branchId: string) {
  return useQuery({
    queryKey: ['branch-dashboard', branchId],
    queryFn: () => dashboardService.getBranchKpis(branchId),
    enabled: !!branchId,
    refetchInterval: 30_000,
  });
}
