import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export function useDashboardKpis() {
  return useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: dashboardService.getKpis,
    refetchInterval: 30_000,
  });
}