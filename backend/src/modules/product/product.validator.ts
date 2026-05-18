import { z } from 'zod';

const productFields = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  original_price: z.number().optional().nullable(),
  image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  sku: z.string().optional(),
  stock_quantity: z.number().int().nonnegative().optional(),
  status: z.enum(['active', 'draft', 'out_of_stock']).optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  slug: z.string().optional(),
  variants: z.array(z.any()).optional(),
});

export const productSchema = z.object({ body: productFields });
export const productUpdateSchema = z.object({ body: productFields.partial() });
