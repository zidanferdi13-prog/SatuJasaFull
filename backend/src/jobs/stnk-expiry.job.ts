import prisma from '../config/prisma';
import { enqueueWhatsApp } from '../shared/services/whatsapp.service';
import logger from '../shared/logger';

const reminderDays = [30, 14, 7, 1];

const dayRange = (daysFromNow: number) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + daysFromNow);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const runStnkExpiryJob = async () => {
  logger.info('[JOB] Running STNK expiry reminders');

  let reminded = 0;

  for (const daysLeft of reminderDays) {
    const { start, end } = dayRange(daysLeft);
    const vehicles = await prisma.vehicle.findMany({
      where: {
        stnkExpiryDate: { gte: start, lte: end },
        customer: { phone: { not: '' } },
      },
      include: {
        customer: { select: { name: true, phone: true } },
        tenant: { select: { name: true } },
      },
    });

    for (const vehicle of vehicles) {
      await enqueueWhatsApp(
        vehicle.tenantId,
        vehicle.customer.phone,
        `Halo ${vehicle.customer.name}, STNK kendaraan ${vehicle.plateNumber} akan jatuh tempo dalam ${daysLeft} hari. Hubungi ${vehicle.tenant.name} untuk perpanjangan.`
      ).catch(() => {});
      reminded += 1;
    }
  }

  logger.info(`[JOB] STNK expiry reminders done. Reminded: ${reminded}`);
};
