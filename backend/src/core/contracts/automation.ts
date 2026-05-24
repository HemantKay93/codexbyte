import { z } from 'zod';

// Triggers
export const TriggerTypes = z.enum([
  'trigger_order_created',
  'trigger_user_signed_up',
  'trigger_abandoned_cart',
  'trigger_custom_event',
]);

// Actions
export const ActionTypes = z.enum([
  'action_email',
  'action_whatsapp',
  'action_push',
  'action_webhook',
]);

// Conditions
export const ConditionTypes = z.enum([
  'condition_delay',
  'condition_if_else',
  'condition_segment_match',
]);

export const FlowStepType = z.union([TriggerTypes, ActionTypes, ConditionTypes]);
export type FlowStepType = z.infer<typeof FlowStepType>;

export const FlowStepSchema = z.object({
  id: z.string(),
  type: FlowStepType,
  config: z.record(z.string(), z.any()).optional(),
  nextStepId: z.string().optional(),
});

export type FlowStep = z.infer<typeof FlowStepSchema>;

export const AutomationFlowSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['active', 'draft', 'archived']),
  flow_steps: z.array(FlowStepSchema),
  created_at: z.string().optional(),
});

export type AutomationFlow = z.infer<typeof AutomationFlowSchema>;

export const AutomationRunPayloadSchema = z.object({
  runId: z.string(),
  flowId: z.string(),
  stepIndex: z.number(),
});

export type AutomationRunPayload = z.infer<typeof AutomationRunPayloadSchema>;
