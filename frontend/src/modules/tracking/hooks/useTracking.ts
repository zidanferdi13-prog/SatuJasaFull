import { useQuery } from '@tanstack/react-query';
import { trackingService } from '../services/tracking.service';

export function useTracking(trackingCode: string) {
  return useQuery({
    queryKey: ['tracking', trackingCode],
    queryFn: () => trackingService.getByCode(trackingCode),
    enabled: !!trackingCode,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
