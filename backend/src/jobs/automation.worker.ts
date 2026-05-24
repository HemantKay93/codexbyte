import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import logger from '../services/logger.js';
import { getAdminClient } from '../config/supabase.js';
import { JobService } from '../services/jobService.js';
import { WhatsAppService } from '../modules/whatsapp/whatsapp.service.js';
import { TemplateEngine } from '../core/template/TemplateEngine.js';

export const automationWorker = new Worker(
  'marketing-automation',
  async (job: Job) => {
    const { runId, flowId, stepIndex } = job.data;
    logger.info(`[AutomationWorker] Processing run ${runId}, step ${stepIndex}`);

    const admin = await getAdminClient();

    // 1. Fetch Flow and Run
    const [flowRes, runRes] = await Promise.all([
      admin.from('automation_flows').select('*').eq('id', flowId).single(),
      admin.from('automation_runs').select('*').eq('id', runId).single(),
    ]);

    if (flowRes.error || !flowRes.data) throw new Error('Flow not found');
    if (runRes.error || !runRes.data) throw new Error('Run not found');

    const flow = flowRes.data;
    const run = runRes.data;

    // Check if run is still active
    if (run.status !== 'active') {
      logger.info(`[AutomationWorker] Run ${runId} is no longer active (status: ${run.status})`);
      return;
    }

    const steps = flow.flow_steps || [];
    if (stepIndex >= steps.length) {
      // Flow completed
      await admin.from('automation_runs').update({ status: 'completed' }).eq('id', runId);
      logger.info(`[AutomationWorker] Flow run ${runId} completed.`);
      return;
    }

    const currentStep = steps[stepIndex];
    const nextStepIndex = stepIndex + 1;
    let delayMs = 0;

    try {
      // 2. Execute Step based on Node Type
      switch (currentStep.type) {
        case 'action_email': {
          const emailAddress = run.trigger_data?.email;
          if (emailAddress) {
            const rawSubject = currentStep.config?.subject || 'Update from ByteEvolvr';
            const rawContent = currentStep.config?.content || 'Here is your update.';

            await JobService.sendEmail(
              emailAddress,
              TemplateEngine.render(rawSubject, run.trigger_data),
              TemplateEngine.render(rawContent, run.trigger_data)
            );
          } else {
            logger.warn(
              `[AutomationWorker] Run ${runId} - Email action failed: No email in trigger_data`
            );
          }
          break;
        }

        case 'action_whatsapp': {
          const phone = run.trigger_data?.phone;
          if (phone) {
            const rawContent = currentStep.config?.content || 'ByteEvolvr Notification';

            await WhatsAppService.enqueueMessage(phone, {
              content: TemplateEngine.render(rawContent, run.trigger_data),
              type: 'text',
            });
          } else {
            logger.warn(
              `[AutomationWorker] Run ${runId} - WhatsApp action failed: No phone in trigger_data`
            );
          }
          break;
        }

        case 'condition_delay': {
          // The node should have { config: { delayMinutes: 60 } } or similar
          const minutes = currentStep.config?.delayMinutes || 0;
          delayMs = minutes * 60 * 1000;
          logger.info(`[AutomationWorker] Run ${runId} delaying next step by ${minutes} minutes.`);
          break;
        }

        default:
          logger.warn(`[AutomationWorker] Unknown node type ${currentStep.type} in flow ${flowId}`);
          break;
      }

      // 3. Update Run Status and Enqueue Next Step
      await admin
        .from('automation_runs')
        .update({ current_step_index: nextStepIndex })
        .eq('id', runId);

      if (nextStepIndex < steps.length) {
        const { automationQueue } = await import('../core/automation/AutomationEngine.js');
        await automationQueue.add(
          'execute-flow-step',
          { runId, flowId, stepIndex: nextStepIndex },
          { delay: delayMs, removeOnComplete: true }
        );
      } else {
        await admin.from('automation_runs').update({ status: 'completed' }).eq('id', runId);
        logger.info(`[AutomationWorker] Flow run ${runId} completed.`);
      }
    } catch (err: any) {
      logger.error(`[AutomationWorker] Error executing step ${stepIndex} for run ${runId}:`, err);
      // Mark run as failed
      await admin.from('automation_runs').update({ status: 'failed' }).eq('id', runId);
      throw err;
    }
  },
  { connection: redis }
);
