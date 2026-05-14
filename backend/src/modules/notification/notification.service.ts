import prisma from '../../config/prisma';
import { getPagination } from '../../shared/utils/pagination';

export class NotificationService {
  static async listQueue(tenantId: string, query: any) {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (query.status) where.status = query.status;

    const [total, items] = await Promise.all([
      prisma.whatsappQueue.count({ where }),
      prisma.whatsappQueue.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { items, total, page, limit };
  }

  static async retry(id: string, tenantId: string) {
    const item = await prisma.whatsappQueue.findFirst({ where: { id, tenantId } });
    if (!item) throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
    if (item.status === 'SENT') throw Object.assign(new Error('Already sent'), { statusCode: 422 });

    return prisma.whatsappQueue.update({
      where: { id },
      data: { status: 'PENDING', attempts: 0, error: null },
    });
  }
}
