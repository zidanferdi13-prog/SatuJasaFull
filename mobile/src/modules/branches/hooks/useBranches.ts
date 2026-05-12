import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService } from '../services/branch.service';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: branchService.list,
    staleTime: 60_000,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: branchService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  });
}