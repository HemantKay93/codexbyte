import { Request, Response } from 'express';
import { CmsRepository } from '../repositories/cmsRepository.js';
import { catchAsync } from '../middlewares/error.js';

const cmsRepo = new CmsRepository();

export const getCmsContent = catchAsync(async (req: Request, res: Response) => {
  const pageSlug = req.params.pageSlug as string;
  const sectionKeys = req.query.sectionKeys
    ? (req.query.sectionKeys as string).split(',')
    : undefined;
  const content = await cmsRepo.findBySlug(pageSlug, sectionKeys);
  res.json(content);
});

export const updateCmsContent = catchAsync(async (req: Request, res: Response) => {
  const pageSlug = req.params.pageSlug as string;
  const sectionKey = req.params.sectionKey as string;
  const { content } = req.body;
  const result = await cmsRepo.upsert(pageSlug, sectionKey, content);
  res.json(result);
});

export const updatePageContent = catchAsync(async (req: Request, res: Response) => {
  const pageSlug = req.params.pageSlug as string;
  const { contentBySection } = req.body;

  const sections = Object.entries(contentBySection).map(([sectionKey, content]) => ({
    sectionKey,
    content,
  }));

  const result = await cmsRepo.upsertBulk(pageSlug, sections);
  res.json(result);
});
