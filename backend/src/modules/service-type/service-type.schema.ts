import { z } from 'zod';

export const createServiceTypeSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
  }),
});

export const updateServiceTypeSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
  }),
});

export const updateServiceTypeStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});
