import { z } from 'zod';

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.number().positive(),
    min_order_amount: z.number().optional().nullable(),
    usage_limit: z.number().optional().nullable(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
  })
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    orderAmount: z.number().positive(),
  })
});

export const createCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.enum(['email', 'whatsapp', 'push']),
    segment_id: z.string().uuid().optional().nullable(),
    template_id: z.string().uuid().optional().nullable(),
    custom_content: z.string().optional().nullable(),
    scheduled_at: z.string().optional().nullable(),
  })
});

export const createSegmentSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    rules: z.any().optional(), // Can be tightened later
  })
});

export const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.enum(['email', 'whatsapp', 'push']),
    subject: z.string().optional().nullable(),
    content: z.string().min(1),
    variables: z.array(z.string()).optional(),
  })
});

export const createAutomationFlowSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    trigger_type: z.string().min(1),
    trigger_conditions: z.any().optional(),
    nodes: z.array(z.any()).optional(),
    edges: z.array(z.any()).optional(),
    is_active: z.boolean().optional(),
  })
});
