import api from '../../../shared/services/api';
import { Branch } from '../../../shared/types';

export interface CreateBranchDTO {
  name: string;
  address?: string;
  phone?: string;
}

export const branchService = {
  list: (): Promise<Branch[]> =>
    api.get('/branches').then((r) => r.data.data),

  // Uses GET /tenants/:id which includes branches[] — no separate /admin/tenants/:id/branches endpoint
  listByTenant: (tenantId: string): Promise<Branch[]> =>
    api.get(`/tenants/${tenantId}`).then((r) => r.data.data?.branches ?? []),

  create: (payload: CreateBranchDTO): Promise<Branch> =>
    api.post('/branches', payload).then((r) => r.data.data),

  update: (id: string, payload: Partial<CreateBranchDTO>): Promise<Branch> =>
    api.put(`/branches/${id}`, payload).then((r) => r.data.data),
};
