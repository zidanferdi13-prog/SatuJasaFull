import apiClient from '../../../shared/services/api-client';
import { ApiResponse, Vehicle, PaginatedMeta } from '../../../shared/types';

export interface VehiclePayload {
  customerId: string;
  plateNumber: string;
  model?: string;
  brand?: string;
  engineNumber?: string;
  chassisNumber?: string;
  registrationYear?: number;
}

export interface VehicleListResult {
  vehicles: Vehicle[];
  meta?: PaginatedMeta;
}

export const vehicleService = {
  list: async (params?: { search?: string; customerId?: string; page?: number; limit?: number }): Promise<VehicleListResult> => {
    const { data } = await apiClient.get<ApiResponse<Vehicle[]>>('/vehicles', { params });
    return { vehicles: data.data || [], meta: data.meta };
  },

  getById: async (id: string): Promise<Vehicle> => {
    const { data } = await apiClient.get<ApiResponse<Vehicle>>(`/vehicles/${id}`);
    return data.data;
  },

  create: async (payload: VehiclePayload): Promise<Vehicle> => {
    const { data } = await apiClient.post<ApiResponse<Vehicle>>('/vehicles', payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<VehiclePayload>): Promise<Vehicle> => {
    const { data } = await apiClient.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, payload);
    return data.data;
  },
};
