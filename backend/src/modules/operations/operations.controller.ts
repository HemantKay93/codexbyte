import { Request, Response } from 'express';
import { OperationsService } from './operations.service.js';

export class OperationsController {
  private service: OperationsService;

  constructor() {
    this.service = new OperationsService();
  }

  async getHealth(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const data = await this.service.getSystemHealth(tenantId);
    res.json({ success: true, data });
  }
}
