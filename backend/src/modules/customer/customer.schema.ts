import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    email: z.string().email().optional(),
    address: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(8).optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
  }),
});
