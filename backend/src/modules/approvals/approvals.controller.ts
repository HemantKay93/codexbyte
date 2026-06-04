import { Request, Response } from 'express';
import { ApprovalsService } from './approvals.service.js';

export class ApprovalsController {
  private service: ApprovalsService;

  constructor() {
    this.service = new ApprovalsService();
  }

  async getTemplates(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const data = await this.service.getTemplates(tenantId);
    res.json({ success: true, data });
  }

  async createTemplate(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const data = await this.service.createTemplate(tenantId, req.body);
    res.status(201).json({ success: true, data });
  }

  async getInbox(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const userId = (req as any).user.id;
    const data = await this.service.getInbox(tenantId, userId);
    res.json({ success: true, data });
  }

  async getAllRequests(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const data = await this.service.getAllRequests(tenantId);
    res.json({ success: true, data });
  }

  async triggerApproval(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    // req.body should contain { template_id, entity_id, payload, steps: [] }
    req.body.requester_id = (req as any).user.id;
    const data = await this.service.triggerApproval(tenantId, req.body);
    res.status(201).json({ success: true, data });
  }

  async processStep(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const { stepId, requestId } = (req.params as Record<string, string>);
    const { status, comments } = req.body;
    const data = await this.service.processStep(tenantId, stepId, requestId, status, comments);
    res.json({ success: true, data });
  }
}
