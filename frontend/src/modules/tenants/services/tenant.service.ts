import client from '../../../api/client';
import { Tenant, CreateTenantDTO } from '../../../shared/types';

export const tenantService = {
  list: async (): Promise<Tenant[]> => {
    const { data } = await client.get('/admin/tenants');
    return data;
  },

  create: async (payload: CreateTenantDTO): Promise<Tenant> => {
    const { data } = await client.post('/admin/tenants', payload);
    return data;
  },

  updateSubscription: async (id: string, subscriptionEnd: string): Promise<Tenant> => {
    const { data } = await client.patch(`/admin/tenants/${id}`, { subscriptionEnd });
    return data;
  },
};
