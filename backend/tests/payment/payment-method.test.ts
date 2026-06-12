import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  transaction: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  payment: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  $transaction: vi.fn(async (callback: any) => callback(prismaMock)),
}));

vi.mock('../../src/config/prisma', () => ({ default: prismaMock }));

import { PaymentService } from '../../src/modules/payment/payment.service';
import { createPaymentSchema } from '../../src/modules/payment/payment.schema';

describe('Payment methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
  });

  it('allows cash payment without reference number', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({ id: 'tx1', tenantId: 'tenant1', status: 'ON_PROCESS', remainingAmount: 200_000 });
    prismaMock.payment.create.mockResolvedValue({ id: 'pay1', method: 'CASH', referenceNumber: null });

    const result = await PaymentService.create('tx1', 'tenant1', {
      amount: 100_000,
      type: 'FINAL_PAYMENT',
      method: 'CASH',
    });

    expect(result).toEqual({ id: 'pay1', method: 'CASH', referenceNumber: null });
    expect(prismaMock.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 'tenant1', transactionId: 'tx1', method: 'CASH' }),
      })
    );
  });

  it('requires reference number for non-cash payment in service', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({ id: 'tx1', tenantId: 'tenant1', status: 'ON_PROCESS', remainingAmount: 200_000 });

    await expect(PaymentService.create('tx1', 'tenant1', {
      amount: 100_000,
      type: 'FINAL_PAYMENT',
      method: 'QRIS',
    })).rejects.toMatchObject({
      message: 'Reference number is required for non-cash payments',
      statusCode: 422,
    });
  });

  it('accepts transfer payment with reference number', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({ id: 'tx1', tenantId: 'tenant1', status: 'ON_PROCESS', remainingAmount: 200_000 });
    prismaMock.payment.create.mockResolvedValue({ id: 'pay1', method: 'TRANSFER', referenceNumber: 'TRX-123' });

    await PaymentService.create('tx1', 'tenant1', {
      amount: 100_000,
      type: 'FINAL_PAYMENT',
      method: 'TRANSFER',
      referenceNumber: 'TRX-123',
    });

    expect(prismaMock.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ method: 'TRANSFER', referenceNumber: 'TRX-123' }),
      })
    );
  });

  it('validates reference number for non-cash payment in schema', () => {
    const result = createPaymentSchema.safeParse({
      body: {
        amount: 100_000,
        type: 'FINAL_PAYMENT',
        method: 'VA',
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]).toMatchObject({
        path: ['body', 'referenceNumber'],
        message: 'Reference number is required for non-cash payments',
      });
    }
  });
});
