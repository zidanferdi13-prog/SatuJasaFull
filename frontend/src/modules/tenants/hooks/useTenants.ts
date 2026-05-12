import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '../services/tenant.service';
import { CreateTenantDTO } from '../../../shared/types';

export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: tenantService.list,
    staleTime: 30_000,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTenantDTO) => tenantService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, subscriptionEnd }: { id: string; subscriptionEnd: string }) =>
      tenantService.updateSubscription(id, subscriptionEnd),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  });
}
