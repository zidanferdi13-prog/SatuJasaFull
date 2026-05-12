import { useQuery } from '@tanstack/react-query';
import { analyticsService, AnalyticsFilters } from '../services/analytics.service';

export function useRevenueAnalytics(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics-revenue', filters],
    queryFn: () => analyticsService.getRevenue(filters),
    staleTime: 60_000,
  });
}

export function useBranchAnalytics(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics-branches', filters],
    queryFn: () => analyticsService.getBranchRevenue(filters),
    staleTime: 60_000,
  });
}
