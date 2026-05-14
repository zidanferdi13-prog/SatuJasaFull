import prisma from '../config/prisma';
import { enqueueWhatsApp } from '../shared/services/whatsapp.service';
import logger from '../shared/logger';

export const runSubscriptionExpiryJob = async () => {
  logger.info('[JOB] Running subscription expiry check');

  const now = new Date();

  // Find tenants where subscription has expired but status not yet updated
  const expiredTenants = await prisma.tenant.findMany({
    where: {
      subscriptionEnd: { lt: now },
      subscriptionStatus: 'ACTIVE',
    },
  });

  for (const tenant of expiredTenants) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { subscriptionStatus: 'EXPIRED' },
    });

    // Find owner to notify
    const owner = await prisma.user.findFirst({
      where: { tenantId: tenant.id, role: 'OWNER' },
    });

    if (owner) {
      await enqueueWhatsApp(
        tenant.id,
        owner.email, // fallback to email if no phone
        `Halo ${tenant.name}, langganan Anda telah berakhir. Hubungi admin untuk perpanjangan.`
      ).catch(() => {});
    }

    logger.info(`[JOB] Marked tenant ${tenant.id} (${tenant.name}) as EXPIRED`);
  }

  // Remind tenants expiring in 7 days
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const soonToExpire = await prisma.tenant.findMany({
    where: {
      subscriptionEnd: { gte: now, lte: weekLater },
      subscriptionStatus: 'ACTIVE',
    },
  });

  for (const tenant of soonToExpire) {
    const daysLeft = Math.ceil((tenant.subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const owner = await prisma.user.findFirst({ where: { tenantId: tenant.id, role: 'OWNER' } });
    if (owner) {
      await enqueueWhatsApp(
        tenant.id,
        owner.email,
        `Halo ${tenant.name}, langganan Anda akan berakhir dalam ${daysLeft} hari. Segera perpanjang!`
      ).catch(() => {});
    }
  }

  logger.info(`[JOB] Subscription expiry job done. Expired: ${expiredTenants.length}, Reminded: ${soonToExpire.length}`);
};
