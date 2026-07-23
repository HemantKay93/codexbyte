import { Response } from 'express';

import { AuthRequest as Request } from '../../middlewares/auth.js';
import { catchAsync } from '../../middlewares/error.js';

import { ReportingService } from './reporting.service.js';

export const getSalesDashboard = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenant_id || '';
  const { startDate, endDate } = req.query;
  const data = await ReportingService.getSalesDashboard(
    tenantId,
    String(startDate || '2000-01-01'),
    String(endDate || new Date().toISOString())
  );
  res.json({ success: true, data });
});

export const getFinancialDashboard = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenant_id || '';
  const { startDate, endDate } = req.query;
  const data = await ReportingService.getFinancialDashboard(
    tenantId,
    String(startDate || '2000-01-01'),
    String(endDate || new Date().toISOString())
  );
  res.json({ success: true, data });
});

export const getInventoryReport = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenant_id || '';
  const data = await ReportingService.getInventoryReport(tenantId);
  res.json({ success: true, data });
});

export const getCrmReport = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenant_id || '';
  const data = await ReportingService.getCrmPipelineReport(tenantId);
  res.json({ success: true, data });
});
