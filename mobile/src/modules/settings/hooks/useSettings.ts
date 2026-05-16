import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings.service';

export function useServiceTypes() {
  return useQuery({
    queryKey: ['service-types'],
    queryFn: settingsService.getServiceTypes,
    staleTime: 1000 * 60 * 10,
  });
}

export function usePricingRules() {
  return useQuery({
    queryKey: ['pricing-rules'],
    queryFn: settingsService.getPricingRules,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateServiceType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) => settingsService.createServiceType(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-types'] }),
  });
}

export function useCreatePricingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { serviceTypeId: string; marginAmount: number }) =>
      settingsService.createPricingRule(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pricing-rules'] }),
  });
}

export function useUpdatePricingRule(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { marginAmount: number; isActive?: boolean }) =>
      settingsService.updatePricingRule(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pricing-rules'] }),
  });
}

export function useTenant() {
  return useQuery({
    queryKey: ['tenant-me'],
    queryFn: settingsService.getTenant,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name?: string; whatsappTemplate?: string }) =>
      settingsService.updateTenant(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-me'] }),
  });
}

export function useUploadLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uri: string) => settingsService.uploadLogo(uri),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-me'] }),
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: settingsService.getSubscription,
    staleTime: 1000 * 60 * 5,
  });
}
