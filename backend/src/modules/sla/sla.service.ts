import { AppError } from '../../middlewares/error.js';

import { SlaRepository } from './sla.repository.js';

export class SlaService {
  private repo: SlaRepository;

  constructor() {
    this.repo = new SlaRepository();
  }

  async getPolicies(tenantId: string) {
    return await this.repo.getPolicies(tenantId);
  }

  async createPolicy(tenantId: string, payload: any) {
    if (!payload.name || !payload.module || !payload.entity_type) {
      throw new AppError('Name, module, and entity_type are required', 400);
    }
    const targets = payload.targets || [];
    return await this.repo.createPolicy(tenantId, payload, targets);
  }

  async getBreaches(tenantId: string) {
    return await this.repo.getBreaches(tenantId);
  }

  async acknowledgeBreach(tenantId: string, breachId: string) {
    return await this.repo.acknowledgeBreach(tenantId, breachId);
  }
}
