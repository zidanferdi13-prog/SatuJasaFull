import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    branchId: z.string().uuid().optional(),
    estimatedFinishDate: z.string().optional(),
    notes: z.string().optional(),
    dpAmount: z.number().nonnegative().default(0),
    items: z.array(z.object({
      vehicleId: z.string().uuid(),
      serviceTypeId: z.string().uuid(),
      baseCost: z.number().nonnegative().optional(),
      price: z.number().nonnegative().optional(),
    })).min(1),
  }),
});

export const updateTransactionStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ON_PROCESS', 'READY_TO_PICKUP', 'COMPLETED', 'CLOSED']),
    notes: z.string().optional(),
  }),
});

export const finalizeTransactionSchema = z.object({
  body: z.object({
    finalTotal: z.number().nonnegative(),
    notes: z.string().optional(),
  }),
});
