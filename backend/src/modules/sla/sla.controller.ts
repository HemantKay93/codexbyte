import { Request, Response } from 'express';
import { SlaService } from './sla.service.js';

export class SlaController {
  private service: SlaService;

  constructor() {
    this.service = new SlaService();
  }

  async getPolicies(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const data = await this.service.getPolicies(tenantId);
    res.json({ success: true, data });
  }

  async createPolicy(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const data = await this.service.createPolicy(tenantId, req.body);
    res.status(201).json({ success: true, data });
  }

  async getBreaches(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const data = await this.service.getBreaches(tenantId);
    res.json({ success: true, data });
  }

  async acknowledgeBreach(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const { id } = (req.params as Record<string, string>);
    const data = await this.service.acknowledgeBreach(tenantId, id);
    res.json({ success: true, data });
  }
}
