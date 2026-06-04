import { Request, Response } from 'express';

import { catchAsync } from '../../middlewares/error.js';

import { TemplateService } from './template.service.js';

const templateService = new TemplateService();

export const getEmailTemplates = catchAsync(async (req: Request, res: Response) => {
  const templates = await templateService.getEmailTemplates();
  res.json({ success: true, data: templates });
});

export const createEmailTemplate = catchAsync(async (req: Request, res: Response) => {
  const template = await templateService.createEmailTemplate(req.body);
  res.status(201).json({ success: true, data: template });
});

export const updateEmailTemplate = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const template = await templateService.updateEmailTemplate(id as string, req.body);
  res.json({ success: true, data: template });
});

export const getPushTemplates = catchAsync(async (req: Request, res: Response) => {
  const templates = await templateService.getPushTemplates();
  res.json({ success: true, data: templates });
});

export const createPushTemplate = catchAsync(async (req: Request, res: Response) => {
  const template = await templateService.createPushTemplate(req.body);
  res.status(201).json({ success: true, data: template });
});

export const updatePushTemplate = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const template = await templateService.updatePushTemplate(id as string, req.body);
  res.json({ success: true, data: template });
});
