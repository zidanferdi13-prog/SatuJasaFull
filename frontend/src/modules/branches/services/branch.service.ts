import api from '../../../shared/services/api';
import { Branch } from '../../../shared/types';

export const branchService = {
  list: (): Promise<Branch[]> =>
    api.get('/branches').then((r) => r.data.data),

  listByTenant: (tenantId: string): Promise<Branch[]> =>
    api.get(`/admin/tenants/${tenantId}/branches`).then((r) => r.data.data),
};
