import { useQuery } from '@tanstack/react-query';
import { branchService } from '../services/branch.service';

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
