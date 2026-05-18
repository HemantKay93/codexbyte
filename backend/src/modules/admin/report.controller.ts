import { Request, Response } from 'express';
import { catchAsync, AppError } from '../../middlewares/error.js';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';
import { PdfService } from '../../services/pdfService.js';
import { OrderRepository } from '../order/order.repository.js';

const orderRepo = new OrderRepository();

export const exportReport = catchAsync(async (req: Request, res: Response) => {
  const { type, format } = req.query;

  // Mock data for export (In a real app, fetch from DB based on type)
  const data = [
    { id: 1, date: '2026-04-20', revenue: 50000, orders: 12, status: 'Completed' },
    { id: 2, date: '2026-04-21', revenue: 75000, orders: 18, status: 'Completed' },
    { id: 3, date: '2026-04-22', revenue: 42000, orders: 9, status: 'Completed' },
  ];

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
