import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService, VehiclePayload } from '../services/vehicle.service';

export function useVehicles(params?: { search?: string; customerId?: string }) {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => vehicleService.list(params),
    select: (result) => result.vehicles,
    staleTime: 60_000,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehicleService.getById(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VehiclePayload) => vehicleService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useUpdateVehicle(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<VehiclePayload>) => vehicleService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      qc.invalidateQueries({ queryKey: ['vehicle', id] });
    },
  });
}
