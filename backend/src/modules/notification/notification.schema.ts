import { z } from 'zod';

export const registerDeviceSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    platform: z.enum(['ios', 'android', 'web']).or(z.string().min(1)),
    deviceId: z.string().optional(),
  }),
});
