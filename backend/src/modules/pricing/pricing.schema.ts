import { z } from 'zod';

export const createPricingRuleSchema = z.object({
  body: z.object({
    serviceTypeId: z.string().uuid(),
    price: z.number().nonnegative(),
    marginAmount: z.number().nonnegative().default(0),
  }),
});

export const updatePricingRuleSchema = z.object({
  body: z.object({
    price: z.number().nonnegative().optional(),
    marginAmount: z.number().nonnegative().optional(),
    isActive: z.boolean().optional(),
  }),
});
