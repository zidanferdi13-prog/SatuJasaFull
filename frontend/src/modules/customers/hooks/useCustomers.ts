import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService, CreateCustomerDTO } from '../services/customer.service';

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: customerService.list,
    staleTime: 30_000,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customerService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerDTO) => customerService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}
