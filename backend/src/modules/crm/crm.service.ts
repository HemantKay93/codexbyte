import { AppError } from '../../middlewares/error.js';
import { eventBus } from '../../core/events/EventBus.js';

import { CrmRepository } from './crm.repository.js';

export class CrmService {
  private crmRepo: CrmRepository;

  constructor() {
    this.crmRepo = new CrmRepository();
  }

  // --- Leads ---
  async getLeads(tenantId: string) {
    return await this.crmRepo.getLeads(tenantId);
  }

  async createLead(tenantId: string, payload: any) {
    if (!payload.email && !payload.phone) {
      throw new AppError('Email or phone is required to create a lead', 400);
    }
    const lead = await this.crmRepo.createLead(tenantId, payload);
    eventBus.publish(<any>'crm.lead.created', { tenantId, leadId: lead.id });
    return lead;
  }

  async updateLeadStatus(tenantId: string, leadId: string, status: string) {
    const updated = await this.crmRepo.updateLeadStatus(tenantId, leadId, status);
    if (!updated) throw new AppError('Lead not found', 404);
    eventBus.publish(<any>'crm.lead.status_changed', { tenantId, leadId, status });
    return updated;
  }

  // --- Opportunities ---
  async getOpportunities(tenantId: string, leadId?: string) {
    return await this.crmRepo.getOpportunities(tenantId, leadId);
  }

  async createOpportunity(tenantId: string, payload: any) {
    if (!payload.name || !payload.lead_id) {
      throw new AppError('Name and Lead ID are required to create an opportunity', 400);
    }

    const opportunity = await this.crmRepo.createOpportunity(tenantId, payload);
    eventBus.publish(<any>'crm.opportunity.created', { tenantId, opportunityId: opportunity.id });
    return opportunity;
  }

  // --- Activities ---
  async getLeadActivities(tenantId: string, leadId: string) {
    return await this.crmRepo.getActivitiesForLead(tenantId, leadId);
  }

  async createActivity(tenantId: string, payload: any) {
    if (!payload.type || !payload.lead_id) {
      throw new AppError('Type and Lead ID are required for activity', 400);
    }
    const activity = await this.crmRepo.createActivity(tenantId, payload);
    eventBus.publish(<any>'crm.activity.created', { tenantId, activityId: activity.id });
    return activity;
  }
  async getPipelines(tenantId: string) {
    return await this.crmRepo.getPipelines(tenantId);
  }

  async getBoardData(tenantId: string, pipelineId: string) {
    return await this.crmRepo.getBoardData(tenantId, pipelineId);
  }

  async createDeal(tenantId: string, payload: any) {
    if (!payload.title || !payload.pipeline_id || !payload.stage_id) {
      throw new AppError('Title, Pipeline ID, and Stage ID are required', 400);
    }
    const deal = await this.crmRepo.createDeal(tenantId, payload);
    eventBus.publish(<any>'crm.deal.created', { tenantId, dealId: deal.id });
    return deal;
  }

  async moveDealStage(tenantId: string, dealId: string, stageId: string) {
    const updated = await this.crmRepo.moveDealStage(tenantId, dealId, stageId);
    eventBus.publish(<any>'crm.deal.stage_changed', { tenantId, dealId, stageId });
    return updated;
  }
}
