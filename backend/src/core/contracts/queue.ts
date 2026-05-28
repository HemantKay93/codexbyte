import { z } from 'zod';

import { CampaignPayloadSchema } from './campaign.js';
import { AutomationRunPayloadSchema } from './automation.js';
import { NotificationPayloadSchema } from './notification.js';

export const QueueJobPayloadSchema = z.object({
  jobId: z.string(),
  type: z.enum(['campaign', 'automation', 'notification', 'system']),
  data: z.union([
    CampaignPayloadSchema,
    z.lazy(() => AutomationRunPayloadSchema),
    z.lazy(() => NotificationPayloadSchema),
    z.record(z.string(), z.any()),
  ]),
  attempts: z.number().int().default(0),
  maxAttempts: z.number().int().default(3),
  timestamp: z.string().datetime(),
});

export type QueueJobPayload = z.infer<typeof QueueJobPayloadSchema>;
