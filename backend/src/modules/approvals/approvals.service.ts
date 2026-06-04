import { ApprovalsRepository } from './approvals.repository.js';
import { AppError } from '../../middlewares/error.js';
import { eventBus } from '../../core/events/EventBus.js';

export class ApprovalsService {
  private repo: ApprovalsRepository;

  constructor() {
    this.repo = new ApprovalsRepository();
  }

  async getTemplates(tenantId: string) {
    return await this.repo.getTemplates(tenantId);
  }

  async createTemplate(tenantId: string, payload: any) {
    if (!payload.name || !payload.module || !payload.entity_type) {
      throw new AppError('Name, module, and entity_type are required', 400);
    }
    return await this.repo.createTemplate(tenantId, payload);
  }

  async getInbox(tenantId: string, userId: string) {
    return await this.repo.getPendingRequestsForApprover(tenantId, userId);
  }

  async getAllRequests(tenantId: string) {
    return await this.repo.getRequests(tenantId);
  }

  async triggerApproval(tenantId: string, payload: { template_id: string, entity_id: string, requester_id: string, payload: any, steps: any[] }) {
    const request = await this.repo.createRequest(tenantId, payload, payload.steps);
    eventBus.publish(<any>'approval.requested', { tenantId, requestId: request.id });
    return request;
  }

  async processStep(tenantId: string, stepId: string, requestId: string, status: 'approved' | 'rejected', comments?: string) {
    // 1. Mark step
    await this.repo.actOnStep(tenantId, stepId, status, comments);

    // 2. Check if entire request is resolved
    if (status === 'rejected') {
      await this.repo.updateRequestStatus(tenantId, requestId, 'rejected');
      eventBus.publish(<any>'approval.rejected', { tenantId, requestId });
    } else {
      // In a real system, we'd check if there are more pending steps for this request.
      // If none, mark as approved. For now, assume single step or all steps parallel.
      await this.repo.updateRequestStatus(tenantId, requestId, 'approved');
      eventBus.publish(<any>'approval.approved', { tenantId, requestId });
    }

    return { success: true, status };
  }
}
