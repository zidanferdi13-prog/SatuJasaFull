import { useQuery, useMutation, useQueryClient } from 'react-query';
import { tenantService } from '../services/tenant.service';
import { CreateTenantDTO } from '../../../shared/types';

export function useTenants() {
  return useQuery('tenants', tenantService.list, {
    staleTime: 30_000,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation(
    (data: CreateTenantDTO) => tenantService.create(data),
    {
      onSuccess: () => queryClient.invalidateQueries('tenants'),
    }
  );
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, subscriptionEnd }: { id: string; subscriptionEnd: string }) =>
      tenantService.updateSubscription(id, subscriptionEnd),
    {
      onSuccess: () => queryClient.invalidateQueries('tenants'),
    }
  );
}
