import { getAdminClient } from '../../config/supabase.js';
import { PeriodService } from './period.service.js';
import { AuditService } from '../../services/auditService.js';

import { Invoice, InvoiceLineItem, JournalHeader, JournalLine } from './accounting.types.js';

export class AccountingRepository {
  // --- Invoices ---
  static async createInvoice(
    invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>,
    lineItems: Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'created_at'>[]
  ) {
    const admin = await getAdminClient();
    const { data: invData, error: invError } = await admin
      .from('invoices')
      .insert([invoice])
      .select('*')
      .single();

    if (invError) throw new Error(`Error creating invoice: ${invError.message}`);

    const itemsToInsert = lineItems.map((item) => ({
      ...item,
      invoice_id: invData.id,
    }));

    const { data: itemsData, error: itemsError } = await admin
      .from('invoice_line_items')
      .insert(itemsToInsert)
      .select('*');

    if (itemsError) throw new Error(`Error creating invoice line items: ${itemsError.message}`);

    return { ...invData, line_items: itemsData };
  }

  static async getInvoices(filters?: { type?: string; status?: string }) {
    const admin = await getAdminClient();
    let query = admin.from('invoices').select('*').order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  static async getInvoiceById(id: string) {
    const admin = await getAdminClient();
    const { data: invoice, error: invError } = await admin
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (invError) throw new Error(`Error fetching invoice: ${invError.message}`);

    const { data: items, error: itemsError } = await admin
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', id);

    if (itemsError) throw new Error(`Error fetching invoice line items: ${itemsError.message}`);

    return { ...invoice, line_items: items };
  }

  static async getAccountByCode(code: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin.from('accounts').select('id').eq('code', code).single();
    if (error) throw new Error(`Error fetching account ${code}: ${error.message}`);
    return data;
  }

  static async createDoubleEntryJournal(
    header: Omit<JournalHeader, 'id' | 'created_at' | 'updated_at'>,
    lines: Omit<JournalLine, 'id' | 'journal_header_id' | 'created_at'>[],
    userId?: string
  ) {
    // Validate period lock (Phase 12)
    await PeriodService.validatePeriodIsOpen(header.transaction_date);

    const admin = await getAdminClient();

    // 1. Insert Header
    const { data: headerData, error: headerError } = await admin
      .from('journal_headers')
      .insert([header])
      .select('*')
      .single();

    if (headerError) throw new Error(`Error creating journal header: ${headerError.message}`);

    // 2. Insert Lines
    const linesToInsert = lines.map((line) => ({
      ...line,
      journal_header_id: headerData.id,
    }));

    const { data: linesData, error: linesError } = await admin
      .from('journal_lines')
      .insert(linesToInsert)
      .select('*');

    if (linesError) {
      // Manual rollback attempt since REST API lacks atomic transactions
      await admin.from('journal_headers').delete().eq('id', headerData.id);
      
      if (userId) {
        await AuditService.log({
          user_id: userId,
          action: 'CREATE_JOURNAL_FAILED_ROLLBACK',
          module: 'Accounting',
          entity_id: headerData.id,
        });
      }

      throw new Error(`Error creating journal lines: ${linesError.message}`);
    }

    if (userId) {
      await AuditService.log({
        user_id: userId,
        action: 'CREATE_JOURNAL',
        module: 'Accounting',
        entity_id: headerData.id,
        new_data: { header: headerData, lines: linesData }
      });
    }

    return { ...headerData, lines: linesData };
  }

  static async getJournalEntries(filters?: { account_type?: string }) {
    const admin = await getAdminClient();
    
    // Fetch headers with their related lines and accounts
    let query = admin
      .from('journal_headers')
      .select('*, lines:journal_lines(*, account:accounts(name, type, code))')
      .order('transaction_date', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    // Optional client side filtering for account_type
    if (filters?.account_type) {
      return data.filter((header: any) => 
        header.lines.some((line: any) => line.account.type === filters.account_type)
      );
    }

    return data;
  }

  static async getAggregatedProfitLoss() {
    // This is a simplified P&L aggregation directly from Journal Entries
    // Revenue = Credits to Revenue accounts minus Debits
    // Expenses = Debits to Expense accounts minus Credits
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('journal_entries')
      .select('account_type, account_name, amount, is_credit');

    if (error) throw new Error(error.message);

    const result = {
      revenue: 0,
      expenses: 0,
      net_profit: 0,
      revenue_breakdown: {} as Record<string, number>,
      expense_breakdown: {} as Record<string, number>,
    };

    for (const entry of data) {
      const value = entry.amount;
      if (entry.account_type === 'Revenue') {
        const adjustedValue = entry.is_credit ? value : -value; // Revenue increases on Credit
        result.revenue += adjustedValue;
        result.revenue_breakdown[entry.account_name] =
          (result.revenue_breakdown[entry.account_name] || 0) + adjustedValue;
      } else if (entry.account_type === 'Expense') {
        const adjustedValue = entry.is_credit ? -value : value; // Expenses increase on Debit
        result.expenses += adjustedValue;
        result.expense_breakdown[entry.account_name] =
          (result.expense_breakdown[entry.account_name] || 0) + adjustedValue;
      }
    }

    result.net_profit = result.revenue - result.expenses;
    return result;
  }
}
