import { Request, Response } from 'express';

import { catchAsync } from '../../middlewares/error.js';
import { CacheService } from '../../services/cacheService.js';

import { CmsRepository } from './cms.repository.js';

const cmsRepo = new CmsRepository();

export const getCmsContent = catchAsync(async (req: Request, res: Response) => {
  const pageSlug = req.params.pageSlug as string;
  const sectionKeys = req.query.sectionKeys
    ? (req.query.sectionKeys as string).split(',')
    : undefined;

  const cacheKey = `cms:content:${pageSlug}:${sectionKeys ? sectionKeys.join(',') : 'all'}`;
  const cached = await CacheService.get(cacheKey);

  if (cached) {
    return res.json({ success: true, data: cached });
  }

  const content = await cmsRepo.findBySlug(pageSlug, sectionKeys);
  await CacheService.set(cacheKey, content, 3600); // 1 hour cache

  res.json({
    success: true,
    data: content,
  });
});

export const updateCmsContent = catchAsync(async (req: Request, res: Response) => {
  const pageSlug = req.params.pageSlug as string;
  const sectionKey = req.params.sectionKey as string;
  const { content } = req.body;
  const result = await cmsRepo.upsert(pageSlug, sectionKey, content);

  await CacheService.invalidatePattern(`cms:content:${pageSlug}:*`);

  res.json({
    success: true,
    message: 'Section updated successfully',
    data: result,
  });
});

export const updatePageContent = catchAsync(async (req: Request, res: Response) => {
  const pageSlug = req.params.pageSlug as string;
  const { contentBySection } = req.body;

  if (!contentBySection || typeof contentBySection !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid content payload' });
  }

  const sections = Object.entries(contentBySection).map(([sectionKey, content]) => ({
    sectionKey,
    content,
  }));

  const result = await cmsRepo.upsertBulk(pageSlug, sections);

  await CacheService.invalidatePattern(`cms:content:${pageSlug}:*`);

  res.json({
    success: true,
    message: 'Page content updated successfully',
    data: result,
  });
});
