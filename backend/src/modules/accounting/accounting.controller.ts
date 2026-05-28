import { Request, Response } from 'express';
import { catchAsync } from '../../middlewares/error.js';
import { AccountingService } from './accounting.service.js';
import { AccountingRepository } from './accounting.repository.js';

export const createInvoice = catchAsync(async (req: Request, res: Response) => {
  const { invoice, lineItems } = req.body;
  const created = await AccountingService.createInvoice(invoice, lineItems);
  res.status(201).json({ status: 'success', data: created });
});

export const getInvoices = catchAsync(async (req: Request, res: Response) => {
  const { type, status } = req.query;
  const invoices = await AccountingRepository.getInvoices({ 
    type: type as string, 
    status: status as string 
  });
  res.status(200).json({ status: 'success', data: invoices });
});

export const getInvoiceById = catchAsync(async (req: Request, res: Response) => {
  const invoice = await AccountingRepository.getInvoiceById(req.params.id as string);
  res.status(200).json({ status: 'success', data: invoice });
});

export const createJournalEntry = catchAsync(async (req: Request, res: Response) => {
  const entry = await AccountingRepository.createJournalEntry(req.body);
  res.status(201).json({ status: 'success', data: entry });
});

export const getJournalEntries = catchAsync(async (req: Request, res: Response) => {
  const { account_type } = req.query;
  const entries = await AccountingRepository.getJournalEntries({ 
    account_type: account_type as string 
  });
  res.status(200).json({ status: 'success', data: entries });
});

export const getProfitLoss = catchAsync(async (req: Request, res: Response) => {
  const report = await AccountingService.getProfitLossReport();
  res.status(200).json({ status: 'success', data: report });
});

export const getGSTReport = catchAsync(async (req: Request, res: Response) => {
  const report = await AccountingService.getGSTReport();
  res.status(200).json({ status: 'success', data: report });
});
