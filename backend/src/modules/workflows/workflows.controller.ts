import { Request, Response } from 'express';
import { WorkflowsService } from './workflows.service.js';

export class WorkflowsController {
  private service: WorkflowsService;

  constructor() {
    this.service = new WorkflowsService();
  }

  async getWorkflows(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const data = await this.service.getWorkflows(tenantId);
    res.json({ success: true, data });
  }

  async createWorkflow(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const data = await this.service.createWorkflow(tenantId, req.body);
    res.status(201).json({ success: true, data });
  }

  async updateWorkflow(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const { id } = (req.params as Record<string, string>);
    const data = await this.service.updateWorkflow(tenantId, id, req.body);
    res.json({ success: true, data });
  }

  async getExecutions(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const workflowId = req.query.workflowId as string;
    const data = await this.service.getExecutions(tenantId, workflowId);
    res.json({ success: true, data });
  }
}
