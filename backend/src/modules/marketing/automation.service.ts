import { getAdminClient } from '../../config/supabase.js';
import logger from '../../services/logger.js';
import { Queue } from 'bullmq';
import { redis } from '../../config/redis.js';

export class AutomationService {
  private automationQueue: Queue;

  constructor() {
    this.automationQueue = new Queue('marketing-automation', { connection: redis });
  }

  /**
   * Listen for system events and trigger relevant automations
   * Example: triggerEvent('cart_abandoned', { userId: '123', cartId: '456' })
   */
  async triggerEvent(eventName: string, payload: any) {
    logger.info(`[AutomationService] Event Triggered: ${eventName}`, payload);

    const admin = await getAdminClient();
    
    // Find all active flows listening to this event
    const { data: flows, error } = await admin
      .from('automation_flows')
      .select('*')
      .eq('trigger_event', eventName)
      .eq('is_active', true);

    if (error) {
      logger.error('[AutomationService] Failed to fetch flows', error);
      return;
    }

    if (!flows || flows.length === 0) return;

    // For each flow, create an automation_run and enqueue the first step
    for (const flow of flows) {
      const { data: run, error: runError } = await admin
        .from('automation_runs')
        .insert({
          flow_id: flow.id,
          user_id: payload.userId || null,
          trigger_data: payload,
          current_step_index: 0,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (runError || !run) {
        logger.error(`[AutomationService] Failed to create run for flow ${flow.id}`, runError);
        continue;
      }

      // Enqueue the first step execution
      await this.automationQueue.add(
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

  async getFlows() {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('automation_flows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Create a new automation flow
   */
  async createFlow(payload: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('automation_flows')
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
