import api from '../../../shared/services/api';
import { Tenant, TenantDetail, CreateTenantDTO } from '../../../shared/types';

export interface TenantFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedTenants {
  data: Tenant[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export const tenantService = {
  // GET /tenants  (SUPER_ADMIN only)
  list: async (filters?: TenantFilters): Promise<PaginatedTenants> => {
    const { data } = await api.get('/tenants', { params: filters });
    return { data: data.data, meta: data.meta };
  },

  // GET /tenants/:id
  getById: async (id: string): Promise<TenantDetail> => {
    const { data } = await api.get(`/tenants/${id}`);
    return data.data as TenantDetail;
  },

  // POST /tenants  (registered via POST /auth/register-tenant)
  create: async (payload: CreateTenantDTO): Promise<Tenant> => {
    const { data } = await api.post('/auth/register-tenant', payload);
    return data.data as Tenant;
  },

  // PUT /tenants/:id
  update: async (id: string, payload: Partial<Pick<Tenant, 'name'> & { phone?: string; address?: string }>): Promise<Tenant> => {
    const { data } = await api.put(`/tenants/${id}`, payload);
    return data.data as Tenant;
  },

  // PATCH /tenants/:id/status — update subscription or isActive
  updateStatus: async (
    id: string,
    payload: { subscriptionEnd?: string; subscriptionStatus?: string; isActive?: boolean },
  ): Promise<Tenant> => {
    const { data } = await api.patch(`/tenants/${id}/status`, payload);
    return data.data as Tenant;
  },

  // POST /tenants/:id/impersonate
  impersonate: async (id: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const { data } = await api.post(`/tenants/${id}/impersonate`);
    return data.data;
  },

  // PATCH /tenants/:id/reset-password
  resetOwnerPassword: async (id: string, newPassword: string): Promise<void> => {
    await api.patch(`/tenants/${id}/reset-password`, { newPassword });
  },
};
