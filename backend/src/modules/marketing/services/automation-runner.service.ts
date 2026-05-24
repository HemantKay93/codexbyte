import { getAdminClient } from '../../../config/supabase.js';
import { JobService } from '../../../services/jobService.js';
import { WhatsAppService } from '../../whatsapp/whatsapp.service.js';
import { TemplateEngine } from '../../../core/template/TemplateEngine.js';
import logger from '../../../services/logger.js';
import { FlowStep } from '../../../core/contracts/automation.js';

export class AutomationRunnerService {
  /**
   * Executes a specific step in an automation flow run
   */
  async executeStep(
    runId: string,
    flowId: string,
    stepIndex: number
  ): Promise<{ nextStepIndex?: number; delayMs: number }> {
    const admin = await getAdminClient();

    const [flowRes, runRes] = await Promise.all([
      admin.from('automation_flows').select('*').eq('id', flowId).single(),
      admin.from('automation_runs').select('*').eq('id', runId).single(),
    ]);

    if (flowRes.error || !flowRes.data) throw new Error('Flow not found');
    if (runRes.error || !runRes.data) throw new Error('Run not found');

    const flow = flowRes.data;
    const run = runRes.data;

    if (run.status !== 'active') {
      logger.info(`[AutomationRunner] Run ${runId} is no longer active.`);
      return { delayMs: 0 };
    }

    const steps: FlowStep[] = flow.flow_steps || [];
    if (stepIndex >= steps.length) {
      await admin.from('automation_runs').update({ status: 'completed' }).eq('id', runId);
      logger.info(`[AutomationRunner] Flow run ${runId} completed.`);
      return { delayMs: 0 };
    }

    const currentStep = steps[stepIndex];
    const nextStepIndex = stepIndex + 1;
    let delayMs = 0;

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
        }
        break;
      }
      case 'condition_delay': {
        const minutes = currentStep.config?.delayMinutes || 0;
        delayMs = minutes * 60 * 1000;
        logger.info(`[AutomationRunner] Run ${runId} delaying next step by ${minutes} minutes.`);
        break;
      }
      default:
        logger.warn(`[AutomationRunner] Unknown node type ${currentStep.type} in flow ${flowId}`);
        break;
    }

    await admin
      .from('automation_runs')
      .update({ current_step_index: nextStepIndex })
      .eq('id', runId);

    if (nextStepIndex >= steps.length) {
      await admin.from('automation_runs').update({ status: 'completed' }).eq('id', runId);
      logger.info(`[AutomationRunner] Flow run ${runId} completed.`);
      return { delayMs: 0 };
    }

    return { nextStepIndex, delayMs };
  }
}
