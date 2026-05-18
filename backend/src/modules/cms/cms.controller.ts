import { Request, Response } from 'express';
import { CmsRepository } from './cms.repository.js';
import { catchAsync } from '../../middlewares/error.js';

const cmsRepo = new CmsRepository();

export const getCmsContent = catchAsync(async (req: Request, res: Response) => {
  const pageSlug = req.params.pageSlug as string;
  const sectionKeys = req.query.sectionKeys
    ? (req.query.sectionKeys as string).split(',')
    : undefined;
  const content = await cmsRepo.findBySlug(pageSlug, sectionKeys);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
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
  res.json({
    success: true,
    message: 'Page content updated successfully',
    data: result,
  });
});
