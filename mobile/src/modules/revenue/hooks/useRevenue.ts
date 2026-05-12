import { useQuery } from '@tanstack/react-query';
import { revenueService } from '../services/revenue.service';

export function useRevenue() {
  return useQuery({
    queryKey: ['revenue'],
    queryFn: revenueService.getSummary,
    refetchInterval: 30_000,
  });
}