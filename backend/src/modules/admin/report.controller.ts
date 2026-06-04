import { Request, Response } from 'express';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';

import { catchAsync, AppError } from '../../middlewares/error.js';
import { PdfService } from '../../services/pdfService.js';
import { OrderRepository } from '../order/order.repository.js';
import { ReportingService } from '../reporting/reporting.service.js';

const orderRepo = new OrderRepository();

export const exportReport = catchAsync(async (req: Request, res: Response) => {
  const { type, format, startDate, endDate } = req.query;
  const tenantId = (req as any).user?.tenant_id || '00000000-0000-0000-0000-000000000000';

  let data: any[] = [];

  if (type === 'sales') {
    const report = await ReportingService.getSalesDashboard(
      tenantId,
      (startDate as string) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      (endDate as string) || new Date().toISOString()
    );
    data = report.orders || [];
  } else if (type === 'inventory') {
    const report = await ReportingService.getInventoryReport(tenantId);
    data = report.lowStockItems || [];
  } else if (type === 'crm') {
    const report = await ReportingService.getCrmPipelineReport(tenantId);
    data = Object.entries(report.funnel).map(([status, count]) => ({ status, count }));
  } else {
    data = [{ error: 'Unknown report type requested.' }];
  }

  if (format === 'excel') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=report_${type}_${Date.now()}.xlsx`);
    return res.send(buffer);
  } else if (format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report_${type}_${Date.now()}.csv`);
    return res.send(csv);
  } else if (format === 'pdf') {
    // For now, return a placeholder or implement a generic table-to-pdf if needed
    // In enterprise, we usually have specific PDF templates
    res
      .status(400)
      .json({ message: 'Generic PDF report export not yet implemented. Use CSV or Excel.' });
  } else {
    res.status(400).json({ message: 'Invalid format' });
  }
});

export const exportInvoice = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const order = await orderRepo.findById(id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  await PdfService.generateInvoice(order, res);
});
