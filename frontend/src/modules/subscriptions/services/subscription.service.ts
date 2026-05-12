import api from '../../../shared/services/api';

export interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  plan: string;
}

export const subscriptionService = {
  list: (): Promise<Subscription[]> =>
    api.get('/admin/subscriptions').then((r) => r.data.data),

  renew: (id: string, endDate: string): Promise<Subscription> =>
    api.patch(`/admin/subscriptions/${id}`, { endDate }).then((r) => r.data.data),
};
