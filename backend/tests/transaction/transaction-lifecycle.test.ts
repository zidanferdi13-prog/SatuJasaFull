import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  transaction: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  transactionLog: {
    create: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
  customer: {
    findUnique: vi.fn(),
  },
  $transaction: vi.fn(async (callback: any) => callback(prismaMock)),
}));

vi.mock('../../src/config/prisma', () => ({ default: prismaMock }));
vi.mock('../../src/shared/services/whatsapp.service', () => ({ enqueueWhatsApp: vi.fn() }));
vi.mock('../../src/modules/branch/branch.service', () => ({
  BranchService: { getOrCreateDefault: vi.fn() },
}));

import { TransactionService } from '../../src/modules/transaction/transaction.service';

describe('Transaction lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
  });

  it('allows DRAFT to ON_PROCESS transition and writes transaction log', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({ id: 'tx1', tenantId: 'tenant1', status: 'DRAFT' });
    prismaMock.transaction.update.mockResolvedValue({ id: 'tx1', status: 'ON_PROCESS' });

    const result = await TransactionService.updateStatus('tx1', 'tenant1', 'user1', 'ON_PROCESS', 'start');

    expect(result).toEqual({ id: 'tx1', status: 'ON_PROCESS' });
    expect(prismaMock.transaction.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'tx1' }, data: { status: 'ON_PROCESS' } })
    );
    expect(prismaMock.transactionLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ fromStatus: 'DRAFT', toStatus: 'ON_PROCESS' }) })
    );
  });

  it('rejects CLOSED to ON_PROCESS transition', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({ id: 'tx1', tenantId: 'tenant1', status: 'CLOSED' });

    await expect(TransactionService.updateStatus('tx1', 'tenant1', 'user1', 'ON_PROCESS')).rejects.toMatchObject({
      message: 'Invalid status transition: CLOSED → ON_PROCESS',
      statusCode: 422,
    });
  });

  it('finalize calculates remaining amount when DP is lower than final total', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({
      id: 'tx1',
      tenantId: 'tenant1',
      dpAmount: 100_000,
      finalTotal: 0,
      remainingAmount: 0,
    });
    prismaMock.transaction.update.mockResolvedValue({ id: 'tx1', finalTotal: 250_000, remainingAmount: 150_000, refundAmount: 0 });

    await TransactionService.finalize('tx1', 'tenant1', 'user1', 250_000);

    expect(prismaMock.transaction.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ finalTotal: 250_000, remainingAmount: 150_000, refundAmount: 0 }) })
    );
  });

  it('finalize calculates refund when DP exceeds final total', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({
      id: 'tx1',
      tenantId: 'tenant1',
      dpAmount: 300_000,
      finalTotal: 0,
      remainingAmount: 0,
    });
    prismaMock.transaction.update.mockResolvedValue({ id: 'tx1', finalTotal: 250_000, remainingAmount: 0, refundAmount: 50_000 });

    await TransactionService.finalize('tx1', 'tenant1', 'user1', 250_000);

    expect(prismaMock.transaction.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ finalTotal: 250_000, remainingAmount: 0, refundAmount: 50_000 }) })
    );
  });

  it('rejects closing transaction before COMPLETED status', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({ id: 'tx1', status: 'ON_PROCESS', remainingAmount: 0 });

    await expect(TransactionService.close('tx1', 'tenant1', 'user1')).rejects.toMatchObject({
      message: 'Transaction must be COMPLETED before closing',
      statusCode: 422,
    });
  });
});
