import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contact_name: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().uuid('Invalid supplier ID'),
  expectedDelivery: z.string().optional(), // ISO date string
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().positive('Quantity must be positive'),
        unitCost: z.number().positive('Unit cost must be positive'),
      })
    )
    .min(1, 'Purchase order must have at least one item'),
});

export const receivePurchaseOrderSchema = z.object({
  warehouseId: z.string().uuid('Invalid warehouse ID'),
});
