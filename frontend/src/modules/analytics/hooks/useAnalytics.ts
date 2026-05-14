import { useQuery } from '@tanstack/react-query';
import { analyticsService, AnalyticsFilters } from '../services/analytics.service';

export function useRevenueSummary(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics-revenue-summary', filters],
    queryFn: () => analyticsService.getRevenueSummary(filters),
    staleTime: 60_000,
  });
}

export function useAdminSnapshot() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: analyticsService.getAdminSnapshot,
    staleTime: 30_000,
  });
}

export function useTenantSnapshot() {
  return useQuery({
    queryKey: ['tenant-dashboard'],
    queryFn: analyticsService.getTenantSnapshot,
    staleTime: 30_000,
  });
}

// Legacy aliases for backward compatibility
export const useRevenueAnalytics = useRevenueSummary;
export const useBranchAnalytics = useTenantSnapshot;
