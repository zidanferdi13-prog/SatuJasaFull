import prisma from '../config/prisma';
import { enqueueWhatsApp } from '../shared/services/whatsapp.service';
import logger from '../shared/logger';

export const runOverdueTransactionJob = async () => {
  logger.info('[JOB] Running overdue transaction check');

  const now = new Date();

  const overdueTransactions = await prisma.transaction.findMany({
    where: {
      status: { in: ['ON_PROCESS', 'READY_TO_PICKUP'] },
      estimatedFinishDate: { lt: now },
    },
    include: {
      tenant: { select: { id: true, name: true } },
      customer: { select: { name: true, phone: true } },
    },
  });

  for (const tx of overdueTransactions) {
    if (tx.customer?.phone) {
      await enqueueWhatsApp(
        tx.tenantId,
        tx.customer.phone,
        `Halo ${tx.customer.name}, transaksi ${tx.invoiceNumber} Anda sudah melewati estimasi penyelesaian. Hubungi kami untuk informasi lebih lanjut.`
      ).catch(() => {});
    }
  }

  logger.info(`[JOB] Overdue transactions notified: ${overdueTransactions.length}`);
};
