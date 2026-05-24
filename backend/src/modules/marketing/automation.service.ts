import { getAdminClient } from '../../config/supabase.js';
import { Queue } from 'bullmq';

import { AutomationEngine, automationQueue } from '../../core/automation/AutomationEngine.js';

export class AutomationService {
  private automationQueue: Queue;

  constructor() {
    this.automationQueue = automationQueue;
  }

  /**
   * Listen for system events and trigger relevant automations
   * Example: triggerEvent('cart_abandoned', { userId: '123', cartId: '456' })
   */
  async triggerEvent(eventName: string, payload: any) {
    // Delegate to the central AutomationEngine
    await AutomationEngine.evaluateTrigger(eventName, payload);
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
