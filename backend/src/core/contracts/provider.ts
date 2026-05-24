import { z } from 'zod';

export const ProviderResponseSchema = z.object({
  success: z.boolean(),
  provider: z.string(),
  messageId: z.string().optional(),
  error: z.string().optional(),
  retryable: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  timestamp: z.string().datetime(),
});

export type ProviderResponse = z.infer<typeof ProviderResponseSchema>;
