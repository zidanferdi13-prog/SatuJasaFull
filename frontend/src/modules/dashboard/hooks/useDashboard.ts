import { useQuery } from 'react-query';
import { dashboardService } from '../services/dashboard.service';

export function useAdminDashboard() {
  return useQuery('admin-dashboard', dashboardService.getAdminKpis, {
    refetchInterval: 30_000,
  });
}
