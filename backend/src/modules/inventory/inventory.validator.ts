import { z } from 'zod';

export const warehouseSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Warehouse name is required'),
    location: z.string().min(2, 'Location is required'),
    contact_phone: z.string().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const stockAdjustmentSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    warehouseId: z.string().uuid('Invalid warehouse ID'),
    quantity: z.number().int(),
    type: z.enum(['in', 'out', 'adjustment', 'return', 'transfer']),
    notes: z.string().optional(),
  }),
});

export const stockTransferSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    fromWarehouseId: z.string().uuid('Invalid source warehouse ID'),
    toWarehouseId: z.string().uuid('Invalid destination warehouse ID'),
    quantity: z.number().int().positive('Quantity must be positive'),
    notes: z.string().optional(),
  }),
});
