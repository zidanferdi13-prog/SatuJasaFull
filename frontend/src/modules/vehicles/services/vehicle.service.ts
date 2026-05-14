import api from '../../../shared/services/api';
import { ApiMeta } from '../../../shared/types';

export interface Vehicle {
  id: string;
  tenantId: string;
  customerId: string;
  plateNumber: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  createdAt: string;
}

export interface VehicleFilters {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
}

export interface CreateVehicleDTO {
  customerId: string;
  plateNumber: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
}

export const vehicleService = {
  // GET /vehicles
  list: async (filters?: VehicleFilters): Promise<{ data: Vehicle[]; meta: ApiMeta }> => {
    const { data } = await api.get('/vehicles', { params: filters });
    return { data: data.data, meta: data.meta };
  },

  // GET /vehicles/:id
  getById: async (id: string): Promise<Vehicle> => {
    const { data } = await api.get(`/vehicles/${id}`);
    return data.data as Vehicle;
  },

  // POST /vehicles
  create: async (payload: CreateVehicleDTO): Promise<Vehicle> => {
    const { data } = await api.post('/vehicles', payload);
    return data.data as Vehicle;
  },

  // PUT /vehicles/:id
  update: async (id: string, payload: Partial<CreateVehicleDTO>): Promise<Vehicle> => {
    const { data } = await api.put(`/vehicles/${id}`, payload);
    return data.data as Vehicle;
  },
};
