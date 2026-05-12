import prisma from '../../config/prisma';

export class TrackingService {
  static async getByToken(token: string) {
    const data = await prisma.transaction.findUnique({
      where: { trackingCode: token },
      include: {
        tenant: { select: { name: true, logoUrl: true } },
        customer: { select: { name: true, phone: true } },
        items: {
          include: {
            service: { select: { name: true } },
            vehicle: { select: { plateNumber: true, model: true } }
          }
        },
        logs: { orderBy: { createdAt: 'desc' } }
      }
    });
    return data;
  }
}
