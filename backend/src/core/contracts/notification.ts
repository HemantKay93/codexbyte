import { z } from 'zod';

export const NotificationPayloadSchema = z.object({
  notificationId: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  body: z.string(),
  type: z.enum(['alert', 'info', 'success', 'warning']),
  link: z.string().url().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  read: z.boolean().default(false),
  timestamp: z.string().datetime(),
});

export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;
