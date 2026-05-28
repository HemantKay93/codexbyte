import { z } from 'zod';

export const ProductBaseSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than zero'),
  sku: z.string().min(1, 'SKU is required'),
  category_id: z.string().uuid().optional(),
  inventory_count: z.number().int().min(0).default(0),
});

export const CreateProductSchema = ProductBaseSchema;

export const UpdateProductSchema = ProductBaseSchema.partial();

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;
export type UpdateProductDTO = z.infer<typeof UpdateProductSchema>;
