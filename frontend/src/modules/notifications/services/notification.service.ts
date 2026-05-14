import api from '../../../shared/services/api';
import { WhatsAppQueueItem, ApiMeta } from '../../../shared/types';

export interface NotificationQueueFilters {
  status?: 'PENDING' | 'SENT' | 'FAILED';
  page?: number;
  limit?: number;
}

export interface PaginatedNotifications {
  data: WhatsAppQueueItem[];
  meta: ApiMeta;
}

export const notificationService = {
  // GET /notifications/queue — SUPER_ADMIN sees all; OWNER/ADMIN sees own tenant
  listQueue: async (filters?: NotificationQueueFilters): Promise<PaginatedNotifications> => {
    const { data } = await api.get('/notifications/queue', { params: filters });
    return { data: data.data, meta: data.meta };
  },

  // POST /notifications/:id/retry — resets status to PENDING
  retry: async (id: string): Promise<WhatsAppQueueItem> => {
    const { data } = await api.post(`/notifications/${id}/retry`);
    return data.data as WhatsAppQueueItem;
  },
};
