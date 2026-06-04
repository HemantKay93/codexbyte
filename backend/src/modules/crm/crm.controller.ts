import { Request, Response } from 'express';

import { CrmService } from './crm.service.js';
import { Customer360Service } from './customer360.service.js';

export class CrmController {
  private crmService: CrmService;
  private c360Service: Customer360Service;

  constructor() {
    this.crmService = new CrmService();
    this.c360Service = new Customer360Service();
  }

  // Customer 360
  async getCustomer360(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const { id } = req.params as Record<string, string>;
    const profile = await this.c360Service.getCustomer360Profile(tenantId, id);
    res.json({ success: true, data: profile });
  }

  // Pipelines
  async getPipelines(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const pipelines = await this.crmService.getPipelines(tenantId);
    res.json({ success: true, data: pipelines });
  }

  async getBoardData(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const pipelineId = req.params.pipelineId as string;
    const board = await this.crmService.getBoardData(tenantId, pipelineId);
    res.json({ success: true, data: board });
  }

  // Deals
  async getDeals(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    // For now we just return opportunities if they ask for deals generally, or maybe we should fetch crm_deals
    // If frontend uses this it might expect crm_deals. Let's redirect to opportunities for legacy or we could implement getDeals.
    // The frontend only uses getBoardData for the board, so we can leave getDeals as is or update it.
    const deals = await this.crmService.getOpportunities(tenantId);
    res.json({ success: true, data: deals });
  }

  async createDeal(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    req.body.assigned_to = req.body.assigned_to || (req as any).user.id;
    const deal = await this.crmService.createDeal(tenantId, req.body);
    res.status(201).json({ success: true, data: deal });
  }

  async moveDeal(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const dealId = req.params.id as string;
    const { stage_id } = req.body;
    const updated = await this.crmService.moveDealStage(tenantId, dealId, stage_id);
    res.json({ success: true, data: updated });
  }

  // Activities
  async getDealActivities(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const activities = await this.crmService.getLeadActivities(
      tenantId,
      (req.params as Record<string, string>).id
    );
    res.json({ success: true, data: activities });
  }

  async createActivity(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    req.body.deal_id = (req.params as Record<string, string>).id;
    req.body.assigned_to = req.body.assigned_to || (req as any).user.id;
    const activity = await this.crmService.createActivity(tenantId, req.body);
    res.status(201).json({ success: true, data: activity });
  }
}
