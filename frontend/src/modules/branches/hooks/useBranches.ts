import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService, CreateBranchDTO } from '../services/branch.service';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: branchService.list,
    staleTime: 60_000,
  });
}

export function useTenantBranches(tenantId: string) {
  return useQuery({
    queryKey: ['branches', tenantId],
    queryFn: () => branchService.listByTenant(tenantId),
    enabled: !!tenantId,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBranchDTO) => branchService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  });
}
