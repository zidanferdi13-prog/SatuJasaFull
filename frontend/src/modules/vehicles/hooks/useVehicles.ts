import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService, VehicleFilters, CreateVehicleDTO } from '../services/vehicle.service';

export function useVehicles(filters?: VehicleFilters) {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => vehicleService.list(filters),
    staleTime: 30_000,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => vehicleService.getById(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVehicleDTO) => vehicleService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateVehicleDTO> }) =>
      vehicleService.update(id, payload),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', vars.id] });
    },
  });
}
