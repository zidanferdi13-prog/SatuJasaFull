import api from '../../../shared/services/api';
import { AuditLog, ApiMeta } from '../../../shared/types';

export interface AuditLogFilters {
  entity?: string;
  action?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  meta: ApiMeta;
}

export const auditService = {
  // GET /audit-logs — SUPER_ADMIN sees all; OWNER sees own tenant
  list: async (filters?: AuditLogFilters): Promise<PaginatedAuditLogs> => {
    const { data } = await api.get('/audit-logs', { params: filters });
    return { data: data.data, meta: data.meta };
  },
};
