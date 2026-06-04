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
    const pipelineId = (req.params as Record<string, string>).pipelineId;
    if (!pipelineId || pipelineId === 'undefined' || pipelineId === 'null') {
      return res.status(400).json({ success: false, error: 'Invalid pipeline ID' });
    }
    const board = await this.crmService.getBoardData(tenantId, pipelineId);
    res.json({ success: true, data: board });
  }

  // Deals
  async getDeals(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const deals = await this.crmService.getDeals(tenantId);
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
    const { id } = req.params as Record<string, string>;
    const { stage_id } = req.body;
    const deal = await this.crmService.moveDealStage(tenantId, id, stage_id);
    res.json({ success: true, data: deal });
  }

  // Activities
  async getDealActivities(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const activities = await this.crmService.getDealActivities(
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
