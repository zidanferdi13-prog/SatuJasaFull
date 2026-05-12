import api from '../../../shared/services/api';
import { Tenant, CreateTenantDTO } from '../../../shared/types';

export const tenantService = {
  list: async (): Promise<Tenant[]> => {
    const { data } = await api.get('/admin/tenants');
    return data;
  },

  create: async (payload: CreateTenantDTO): Promise<Tenant> => {
    const { data } = await api.post('/admin/tenants', payload);
    return data;
  },

  updateSubscription: async (id: string, subscriptionEnd: string): Promise<Tenant> => {
    const { data } = await api.patch(`/admin/tenants/${id}`, { subscriptionEnd });
    return data;
  },
};
