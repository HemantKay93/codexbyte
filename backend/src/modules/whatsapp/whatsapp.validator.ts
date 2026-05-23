import { z } from 'zod';

export const SendMessageSchema = z.object({
  to: z.string().min(10, 'Phone number is too short').max(20, 'Phone number is too long'),
  content: z.string().min(1, 'Message content is required'),
  type: z.enum(['text', 'image', 'document', 'template']).optional().default('text'),
  mediaUrl: z.string().url().optional(),
  templateId: z.string().optional(),
  variables: z.any().optional(),
});

export const ReconnectSessionSchema = z.object({
  sessionName: z.string().optional().default('default'),
});
