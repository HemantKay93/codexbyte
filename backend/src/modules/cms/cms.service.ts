import { CmsRepository } from './cms.repository.js';

const cmsRepo = new CmsRepository();

export class CMSService {
  static async getContent(pageSlug: string, sectionKeys?: string[]) {
    return await cmsRepo.findBySlug(pageSlug, sectionKeys);
  }

  static async updateContent(pageSlug: string, sectionKey: string, content: any) {
    return await cmsRepo.upsert(pageSlug, sectionKey, content);
  }

  static async updatePageContent(pageSlug: string, sections: { sectionKey: string; content: any }[]) {
    return await cmsRepo.upsertBulk(pageSlug, sections);
  }
}