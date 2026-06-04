import { Request, Response } from 'express';

import { catchAsync } from '../../middlewares/error.js';

import { CampaignOrchestratorService } from './services/campaign-orchestrator.service.js';

const campaignService = new CampaignOrchestratorService();

export const getCampaigns = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await campaignService.getCampaigns(page, limit);
  res.json({
    success: true,
    message: 'Campaigns fetched successfully',
    data: result.data,
    pagination: {
      total: result.count,
      page: result.page,
      limit: result.limit,
    },
  });
});

export const createCampaign = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const payload = {
    campaignId: crypto.randomUUID(),
    name: body.name,
    segmentId: body.segment_id,
    channel: body.type, // map frontend 'type' to backend 'channel'
    templateId: body.template_id,
    content: body.custom_content,
    scheduledFor: body.scheduled_at,
    createdBy: req.user?.id || '00000000-0000-0000-0000-000000000000',
  };
  const campaign = await campaignService.createCampaign(payload as any);

  res.status(201).json({
    success: true,
    message: 'Campaign created successfully',
    data: campaign,
  });
});

export const enqueueCampaign = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await campaignService.enqueueCampaign(id as string);

  res.json({
    success: true,
    message: 'Campaign queued successfully',
  });
});
