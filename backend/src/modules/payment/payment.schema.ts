import { z } from 'zod';

const nonCashMethods = new Set(['TRANSFER', 'QRIS', 'VA', 'EDC']);

export const createPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    type: z.enum(['DP', 'FINAL_PAYMENT', 'REFUND']),
    method: z.enum(['CASH', 'TRANSFER', 'QRIS', 'VA', 'EDC']).default('CASH'),
    referenceNumber: z.string().trim().optional(),
    notes: z.string().optional(),
  }).superRefine((body, ctx) => {
    if (nonCashMethods.has(body.method) && !body.referenceNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['referenceNumber'],
        message: 'Reference number is required for non-cash payments',
      });
    }
  }),
});
