import { z } from 'zod';

export const CampaignPayloadSchema = z.object({
  campaignId: z.string().uuid(),
  name: z.string(),
  segmentId: z.string().uuid().optional(),
  channel: z.enum(['email', 'whatsapp', 'push']),
  templateId: z.string().uuid().optional(),
  content: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  scheduledFor: z.string().datetime().optional(),
  createdBy: z.string().uuid(),
});

export type CampaignPayload = z.infer<typeof CampaignPayloadSchema>;
