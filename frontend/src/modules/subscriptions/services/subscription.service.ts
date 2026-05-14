import api from '../../../shared/services/api';
import { Tenant } from '../../../shared/types';

// Subscription data lives on the Tenant model.
// SUPER_ADMIN manages subscriptions via PATCH /tenants/:id/status.
export interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  planName: string;
  planPrice: number;
}

export const subscriptionService = {
  // List tenants with subscription info — GET /tenants (SUPER_ADMIN)
  list: async (): Promise<Tenant[]> => {
    const { data } = await api.get('/tenants', { params: { limit: 100 } });
    return data.data as Tenant[];
  },

  // Renew / update subscription — PATCH /tenants/:id/status
  renew: async (tenantId: string, subscriptionEnd: string): Promise<Tenant> => {
    const { data } = await api.patch(`/tenants/${tenantId}/status`, {
      subscriptionEnd,
      subscriptionStatus: 'ACTIVE',
    });
    return data.data as Tenant;
  },

  // Suspend tenant — PATCH /tenants/:id/status
  suspend: async (tenantId: string): Promise<Tenant> => {
    const { data } = await api.patch(`/tenants/${tenantId}/status`, {
      subscriptionStatus: 'SUSPENDED',
    });
    return data.data as Tenant;
  },
};
