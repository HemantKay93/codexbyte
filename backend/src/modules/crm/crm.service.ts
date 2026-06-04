import { AppError } from '../../middlewares/error.js';
import { eventBus } from '../../core/events/EventBus.js';

import { CrmRepository } from './crm.repository.js';

export class CrmService {
  private crmRepo: CrmRepository;

  constructor() {
    this.crmRepo = new CrmRepository();
  }

  // --- Pipelines & Stages ---
  async getPipelines(tenantId: string) {
    const pipelines = await this.crmRepo.getPipelines(tenantId);
    if (pipelines.length === 0) {
      // Auto-init default pipeline if none exist
      const defaultPipeline = await this.crmRepo.createPipeline(tenantId, 'Standard Sales', true);
      await this.crmRepo.createStage(tenantId, defaultPipeline.id, 'Lead', 10, 10);
      await this.crmRepo.createStage(tenantId, defaultPipeline.id, 'Qualified', 20, 30);
      await this.crmRepo.createStage(tenantId, defaultPipeline.id, 'Proposal', 30, 60);
      await this.crmRepo.createStage(tenantId, defaultPipeline.id, 'Negotiation', 40, 80);
      await this.crmRepo.createStage(tenantId, defaultPipeline.id, 'Won', 50, 100);
      await this.crmRepo.createStage(tenantId, defaultPipeline.id, 'Lost', 60, 0);
      pipelines.push(defaultPipeline);
    }

    // Attach stages to pipelines
    for (const p of pipelines) {
      p.stages = await this.crmRepo.getStages(tenantId, p.id);
    }
    return pipelines;
  }

  async getBoardData(tenantId: string, pipelineId: string) {
    const stages = await this.crmRepo.getStages(tenantId, pipelineId);
    const deals = await this.crmRepo.getDeals(tenantId, pipelineId);

    return stages.map((stage: any) => {
      return {
        ...stage,
        deals: deals.filter((d: any) => d.stage_id === stage.id),
      };
    });
  }

  // --- Deals ---
  async getDeals(tenantId: string) {
    return await this.crmRepo.getDeals(tenantId);
  }

  async createDeal(tenantId: string, payload: any) {
    if (!payload.title || !payload.pipeline_id || !payload.stage_id) {
      throw new AppError('Title, pipeline, and stage are required to create a deal', 400);
    }

    const deal = await this.crmRepo.createDeal(tenantId, payload);
    eventBus.publish(<any>'crm.deal.created', { tenantId, dealId: deal.id });
    return deal;
  }

  async moveDealStage(tenantId: string, dealId: string, stageId: string) {
    const updated = await this.crmRepo.updateDealStage(tenantId, dealId, stageId);
    if (!updated) throw new AppError('Deal not found', 404);
    eventBus.publish(<any>'crm.deal.stage_changed', { tenantId, dealId, stageId });
    return updated;
  }

  // --- Activities ---
  async getDealActivities(tenantId: string, dealId: string) {
    return await this.crmRepo.getActivitiesForDeal(tenantId, dealId);
  }

  async createActivity(tenantId: string, payload: any) {
    if (!payload.title || !payload.activity_type) {
      throw new AppError('Title and activity type are required', 400);
    }
    const activity = await this.crmRepo.createActivity(tenantId, payload);
    eventBus.publish(<any>'crm.activity.created', { tenantId, activityId: activity.id });
    return activity;
  }
}
