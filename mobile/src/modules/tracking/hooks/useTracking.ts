import { useQuery } from '@tanstack/react-query';
import { trackingService } from '../services/tracking.service';

export function useTracking(token: string) {
  return useQuery({
    queryKey: ['tracking', token],
    queryFn: () => trackingService.getByToken(token),
    enabled: !!token,
  });
}