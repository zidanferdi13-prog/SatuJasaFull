import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    type: z.enum(['DP', 'FINAL_PAYMENT', 'REFUND']),
    method: z.enum(['CASH']).default('CASH'),
    notes: z.string().optional(),
  }),
});
