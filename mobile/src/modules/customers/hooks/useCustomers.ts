import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customer.service';

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: customerService.list,
    staleTime: 60_000,
  });
}

export function useCustomerSearch(q: string) {
  return useQuery({
    queryKey: ['customers', 'search', q],
    queryFn: () => customerService.search(q),
    enabled: q.length >= 2,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}