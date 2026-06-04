import { AppError } from '../../middlewares/error.js';

import { WorkflowsRepository } from './workflows.repository.js';

export class WorkflowsService {
  private repo: WorkflowsRepository;

  constructor() {
    this.repo = new WorkflowsRepository();
  }

  async getWorkflows(tenantId: string) {
    return await this.repo.getWorkflows(tenantId);
  }

  async createWorkflow(tenantId: string, payload: any) {
    if (!payload.name || !payload.trigger_event) {
      throw new AppError('Name and trigger_event are required', 400);
    }
    return await this.repo.createWorkflow(tenantId, payload);
  }

  async updateWorkflow(tenantId: string, id: string, payload: any) {
    return await this.repo.updateWorkflow(tenantId, id, payload);
  }

  async getExecutions(tenantId: string, workflowId?: string) {
    return await this.repo.getExecutions(tenantId, workflowId);
  }
}
