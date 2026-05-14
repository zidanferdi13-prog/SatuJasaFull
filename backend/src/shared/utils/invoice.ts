import prisma from '../../config/prisma';

export const generateInvoiceNumber = async (tenantId: string, tenantCode: string): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthStr = String(month).padStart(2, '0');

  // Upsert invoice sequence with atomic increment
  const seq = await prisma.$transaction(async (tx) => {
    const existing = await tx.invoiceSequence.findUnique({
      where: { tenantId_year_month: { tenantId, year, month } },
    });

    if (existing) {
      return tx.invoiceSequence.update({
        where: { tenantId_year_month: { tenantId, year, month } },
        data: { lastSeq: { increment: 1 } },
      });
    } else {
      return tx.invoiceSequence.create({
        data: { tenantId, year, month, lastSeq: 1 },
      });
    }
  });

  const runningNumber = String(seq.lastSeq).padStart(4, '0');
  return `INV/${tenantCode}/${year}/${monthStr}/${runningNumber}`;
};

export const generateTrackingCode = (tenantCode: string): string => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TRX-${tenantCode}-${ts}-${rand}`;
};
