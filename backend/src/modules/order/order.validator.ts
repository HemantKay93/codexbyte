import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().positive('Quantity must be positive'),
      })
    )
    .min(1, 'At least one item is required'),
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(3, 'ZIP code is required'),
    country: z.string().min(2, 'Country is required'),
  }),
  paymentMethod: z.enum(['card', 'upi', 'netbanking', 'wallet', 'cod']).optional(),
  couponCode: z.string().optional(),
});
