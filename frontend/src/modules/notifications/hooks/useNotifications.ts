import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, NotificationQueueFilters } from '../services/notification.service';

export function useNotificationQueue(filters?: NotificationQueueFilters) {
  return useQuery({
    queryKey: ['notifications-queue', filters],
    queryFn: () => notificationService.listQueue(filters),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useRetryNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.retry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-queue'] }),
  });
}
