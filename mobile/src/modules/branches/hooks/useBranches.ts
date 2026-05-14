import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService, BranchPayload } from '../services/branch.service';
import { useAuthStore } from '../../../store/authStore';
import { Branch } from '../../../shared/types';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: branchService.list,
    staleTime: 60_000 * 5,
  });
}

export function useBranch(id: string) {
  return useQuery({
    queryKey: ['branch', id],
    queryFn: () => branchService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BranchPayload) => branchService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
  });
}

export function useUpdateBranch(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<BranchPayload>) => branchService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] });
      qc.invalidateQueries({ queryKey: ['branch', id] });
    },
  });
}

export function useSelectBranch() {
  const setSelectedBranch = useAuthStore((s) => s.setSelectedBranch);
  return { selectBranch: (branch: Branch | null) => setSelectedBranch(branch) };
}
