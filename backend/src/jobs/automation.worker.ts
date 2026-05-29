import { Worker, Job } from 'bullmq';

import { redis } from '../config/redis.js';
import logger from '../services/logger.js';
import { getAdminClient } from '../config/supabase.js';
import { AutomationRunnerService } from '../modules/marketing/services/automation-runner.service.js';
import { AutomationRunPayload } from '../core/contracts/automation.js';

const automationRunner = new AutomationRunnerService();

export const automationWorker = new Worker(
  'marketing-automation',
  async (job: Job<AutomationRunPayload>) => {
    const { runId, flowId, stepIndex } = job.data;
    logger.info(`[AutomationWorker] Processing run ${runId}, step ${stepIndex}`);

    const admin = await getAdminClient();

    try {
      const { nextStepIndex, delayMs } = await automationRunner.executeStep(
        runId,
        flowId,
        stepIndex
      );

      if (nextStepIndex !== undefined) {
        const { automationQueue } = await import('../core/automation/AutomationEngine.js');
        await automationQueue.add(
          'execute-flow-step',
          { runId, flowId, stepIndex: nextStepIndex },
          { delay: delayMs, removeOnComplete: true }
        );
      }
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      // eslint-disable-line @typescript-eslint/no-explicit-any
      logger.error(`[AutomationWorker] Error executing step ${stepIndex} for run ${runId}:`, err);
      // Mark run as failed
      await admin.from('automation_runs').update({ status: 'failed' }).eq('id', runId);
      throw err;
    }
  },
  {
    skipVersionCheck: true, connection: redis,
    stalledInterval: 300_000, // Check stalled jobs every 5 min (default: 30s)
    lockDuration: 600_000, // Lock for 10 min (must exceed stalledInterval)
    drainDelay: 60, // Poll every 60s when idle — saves ~1M Redis commands/month vs 10s
    removeOnComplete: { count: 100 }, // Auto-cleanup completed jobs
    removeOnFail: { count: 200 }, // Keep last 200 failures for debugging
  }
);
