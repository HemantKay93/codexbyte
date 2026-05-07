import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  category_id: z.string().uuid().optional(),
  stock_quantity: z.number().int().nonnegative().default(0),
  sku: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  is_active: z.boolean().default(true),
  metadata: z.record(z.any()).optional()
});

export const updateProductSchema = createProductSchema.partial();
