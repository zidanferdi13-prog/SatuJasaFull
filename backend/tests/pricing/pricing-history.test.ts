import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  pricingRule: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  pricingRuleHistory: {
    create: vi.fn(),
  },
  $transaction: vi.fn(async (callback: any) => callback(prismaMock)),
}));

vi.mock('../../src/config/prisma', () => ({ default: prismaMock }));

import { PricingService } from '../../src/modules/pricing/pricing.service';

describe('Pricing history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
  });

  it('creates history snapshot when pricing rule is updated', async () => {
    prismaMock.pricingRule.findFirst.mockResolvedValue({
      id: 'rule1',
      tenantId: 'tenant1',
      serviceTypeId: 'service1',
      price: 100_000,
      marginAmount: 100_000,
      isActive: true,
    });
    prismaMock.pricingRule.update.mockResolvedValue({
      id: 'rule1',
      tenantId: 'tenant1',
      serviceTypeId: 'service1',
      price: 150_000,
      marginAmount: 150_000,
      isActive: false,
    });

    const result = await PricingService.update('rule1', 'tenant1', 'user1', {
      marginAmount: 150_000,
      isActive: false,
    });

    expect(result).toEqual(expect.objectContaining({ price: 150_000, marginAmount: 150_000, isActive: false }));
    expect(prismaMock.pricingRule.update).toHaveBeenCalledWith({
      where: { id: 'rule1' },
      data: { marginAmount: 150_000, isActive: false, price: 150_000 },
    });
    expect(prismaMock.pricingRuleHistory.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant1',
        pricingRuleId: 'rule1',
        serviceTypeId: 'service1',
        oldPrice: 100_000,
        newPrice: 150_000,
        oldMargin: 100_000,
        newMargin: 150_000,
        oldIsActive: true,
        newIsActive: false,
        changedBy: 'user1',
      },
    });
  });

  it('rejects update when pricing rule does not exist in tenant', async () => {
    prismaMock.pricingRule.findFirst.mockResolvedValue(null);

    await expect(PricingService.update('rule1', 'tenant1', 'user1', { price: 150_000 })).rejects.toMatchObject({
      message: 'Pricing rule not found',
      statusCode: 404,
    });
  });
});
