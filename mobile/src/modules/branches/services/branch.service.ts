import apiClient from '../../../shared/services/api-client';
import { ApiResponse, Branch } from '../../../shared/types';

export interface BranchPayload {
  name: string;
  address?: string;
  phone?: string;
}

export const branchService = {
  list: async (): Promise<Branch[]> => {
    const { data } = await apiClient.get<ApiResponse<Branch[]>>('/branches');
    return data.data || [];
  },

  getById: async (id: string): Promise<Branch> => {
    const { data } = await apiClient.get<ApiResponse<Branch>>(`/branches/${id}`);
    return data.data;
  },

  create: async (payload: BranchPayload): Promise<Branch> => {
    const { data } = await apiClient.post<ApiResponse<Branch>>('/branches', payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<BranchPayload>): Promise<Branch> => {
    const { data } = await apiClient.put<ApiResponse<Branch>>(`/branches/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/branches/${id}`);
  },
};