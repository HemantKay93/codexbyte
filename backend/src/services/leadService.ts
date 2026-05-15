import { LeadRepository } from '../repositories/leadRepository.js';
import logger from './logger.js';

const leadRepo = new LeadRepository();

export class LeadService {
  async createLead(leadData: any) {
    const data = await leadRepo.create(leadData);
    logger.info(`[LeadService] New inquiry from ${leadData.email}`);
    return data;
  }

  async getAllLeads() {
    return await leadRepo.findAll();
  }
}
