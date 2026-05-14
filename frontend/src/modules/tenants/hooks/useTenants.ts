import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService, TenantFilters } from '../services/tenant.service';
import { CreateTenantDTO } from '../../../shared/types';

export function useTenants(filters?: TenantFilters) {
  return useQuery({
    queryKey: ['tenants', filters],
    queryFn: () => tenantService.list(filters),
    staleTime: 30_000,
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: ['tenants', id],
    queryFn: () => tenantService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTenantDTO) => tenantService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  });
}

export function useUpdateTenantStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { subscriptionEnd?: string; subscriptionStatus?: string; isActive?: boolean };
    }) => tenantService.updateStatus(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  });
}

// Legacy alias
export const useUpdateSubscription = useUpdateTenantStatus;

export function useUpdateTenant(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name?: string; phone?: string; address?: string }) =>
      tenantService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants', id] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
}

export function useImpersonateTenant() {
  return useMutation({
    mutationFn: (id: string) => tenantService.impersonate(id),
  });
}

export function useResetOwnerPassword(id: string) {
  return useMutation({
    mutationFn: (newPassword: string) => tenantService.resetOwnerPassword(id, newPassword),
  });
}
