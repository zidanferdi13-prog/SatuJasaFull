import apiClient from '../../../shared/services/api-client';
import { ApiResponse, Customer, PaginatedMeta } from '../../../shared/types';

export interface CustomerListResult {
  customers: Customer[];
  meta?: PaginatedMeta;
}

export interface CustomerPayload {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export const customerService = {
  list: async (params?: { search?: string; page?: number; limit?: number }): Promise<CustomerListResult> => {
    const { data } = await apiClient.get<ApiResponse<Customer[]>>('/customers', { params });
    return { customers: data.data || [], meta: data.meta };
  },

  getById: async (id: string): Promise<Customer> => {
    const { data } = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return data.data;
  },

  create: async (payload: CustomerPayload): Promise<Customer> => {
    const { data } = await apiClient.post<ApiResponse<Customer>>('/customers', payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<CustomerPayload>): Promise<Customer> => {
    const { data } = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, payload);
    return data.data;
  },
};