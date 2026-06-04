import { getAdminClient } from '../../config/supabase.js';
import { AuditService } from '../../services/auditService.js';

import { PeriodService } from './period.service.js';
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

  static async getAccountByCode(tenantId: string, code: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('accounting_accounts')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('code', code)
      .single();
    if (error) throw new Error(`Error fetching account ${code}: ${error.message}`);
    return data;
  }

  static async createDoubleEntryJournal(
    header: Omit<JournalHeader, 'id' | 'created_at' | 'updated_at'>,
    lines: Omit<JournalLine, 'id' | 'journal_id' | 'created_at'>[],
    userId?: string
  ) {
    // Validate period lock (Phase 12)
    // await PeriodService.validatePeriodIsOpen(header.transaction_date, header.tenant_id);

    const admin = await getAdminClient();

    // 1. Insert Header
    const { data: headerData, error: headerError } = await admin
      .from('accounting_journals')
      .insert([header])
      .select('*')
      .single();

    if (headerError) throw new Error(`Error creating journal header: ${headerError.message}`);

    // 2. Insert Lines
    const linesToInsert = lines.map((line) => ({
      ...line,
      journal_id: headerData.id,
    }));

    const { data: linesData, error: linesError } = await admin
      .from('accounting_journal_lines')
      .insert(linesToInsert)
      .select('*');

    if (linesError) {
      // Manual rollback attempt since REST API lacks atomic transactions
      await admin.from('accounting_journals').delete().eq('id', headerData.id);

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
        new_data: { header: headerData, lines: linesData },
      });
    }

    return { ...headerData, lines: linesData };
  }

  static async getJournalEntries(tenantId: string, filters?: { account_type?: string }) {
    const admin = await getAdminClient();

    // Fetch headers with their related lines and accounts
    const query = admin
      .from('accounting_journals')
      .select('*, lines:accounting_journal_lines(*, account:accounting_accounts(name, type, code))')
      .eq('tenant_id', tenantId)
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

  static async getAggregatedProfitLoss(tenantId: string) {
    const admin = await getAdminClient();

    // For proper P&L we should query journal lines joined with accounts and headers
    // Note: With Supabase REST API, joining 3 tables directly is tricky without a view.
    // We'll fetch all posted journal lines for the tenant for Revenue and Expense accounts.

    const { data, error } = await admin
      .from('accounting_journal_lines')
      .select(
        `
        debit_amount,
        credit_amount,
        accounting_accounts!inner(name, type),
        accounting_journals!inner(status, tenant_id)
      `
      )
      .eq('accounting_journals.tenant_id', tenantId)
      .eq('accounting_journals.status', 'posted')
      .in('accounting_accounts.type', ['revenue', 'expense']);

    if (error) throw new Error(error.message);

    const result = {
      revenue: 0,
      expenses: 0,
      net_profit: 0,
      revenue_breakdown: {} as Record<string, number>,
      expense_breakdown: {} as Record<string, number>,
    };

    for (const entry of data as any[]) {
      const type = entry.accounting_accounts.type;
      const accountName = entry.accounting_accounts.name;
      const debit = Number(entry.debit_amount) || 0;
      const credit = Number(entry.credit_amount) || 0;

      if (type === 'revenue') {
        // Revenue increases on Credit
        const adjustedValue = credit - debit;
        result.revenue += adjustedValue;
        result.revenue_breakdown[accountName] =
          (result.revenue_breakdown[accountName] || 0) + adjustedValue;
      } else if (type === 'expense') {
        // Expenses increase on Debit
        const adjustedValue = debit - credit;
        result.expenses += adjustedValue;
        result.expense_breakdown[accountName] =
          (result.expense_breakdown[accountName] || 0) + adjustedValue;
      }
    }

    result.net_profit = result.revenue - result.expenses;
    return result;
  }
}
