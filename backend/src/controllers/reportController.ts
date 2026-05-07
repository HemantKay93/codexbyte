import { Request, Response } from 'express';
import { catchAsync } from '../middlewares/error.js';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';

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

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report_${type}_${Date.now()}.xlsx`);
    return res.send(buffer);
  } else {
    const parser = new Parser();
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report_${type}_${Date.now()}.csv`);
    return res.send(csv);
  }
});
