import { Queue } from 'bullmq';

import { getAdminClient } from '../../config/supabase.js';
import logger from '../../services/logger.js';
import { redis } from '../../config/redis.js';

export const automationQueue = new Queue('marketing-automation', { connection: redis });

export class AutomationEngine {
  /**
   * Listen for system events and trigger relevant automations
   * Example: evaluateTrigger('order.created', { customerId: '123', orderId: '456' })
   */
  static async evaluateTrigger(eventName: string, payload: Record<string, any>) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-line @typescript-eslint/no-explicit-any
    logger.info(`[AutomationEngine] Evaluating trigger: ${eventName}`);

    const admin = await getAdminClient();

    // Find all active flows listening to this event
    const { data: flows, error } = await admin
      .from('automation_flows')
      .select('*')
      .eq('trigger_event', eventName)
      .eq('is_active', true);

    if (error) {
      logger.error('[AutomationEngine] Failed to fetch flows', error);
      return;
    }

    if (!flows || flows.length === 0) {
      logger.info(`[AutomationEngine] No active flows found for event: ${eventName}`);
      return;
    }

    // For each flow, create an automation_run and enqueue the first step
    for (const flow of flows) {
      // Evaluate conditions here before starting the run if trigger_conditions exist
      // For now, assume it passes the base trigger

      const { data: run, error: runError } = await admin
        .from('automation_runs')
        .insert({
          flow_id: flow.id,
          user_id: payload.customerId || payload.userId || null,
          trigger_data: payload,
          current_step_index: 0,
          status: 'active',
        })
        .select()
        .single();

      if (runError || !run) {
        logger.error(`[AutomationEngine] Failed to create run for flow ${flow.id}`, runError);
        continue;
      }

      logger.info(`[AutomationEngine] Started flow run ${run.id} for flow ${flow.id}`);

      // Enqueue the first step execution
      await automationQueue.add(
        'execute-flow-step',
        {
          runId: run.id,
          flowId: flow.id,
          stepIndex: 0,
        },
        {
          removeOnComplete: true,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        }
      );
    }
  }
}
