import { getAdminClient } from '../../config/supabase.js';

import { Invoice, InvoiceLineItem, JournalEntry } from './accounting.types.js';

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

  // --- Journal Entries ---
  static async createJournalEntry(entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('journal_entries')
      .insert([entry])
      .select('*')
      .single();

    if (error) throw new Error(`Error creating journal entry: ${error.message}`);
    return data;
  }

  static async getJournalEntries(filters?: { account_type?: string }) {
    const admin = await getAdminClient();
    let query = admin.from('journal_entries').select('*').order('entry_date', { ascending: false });

    if (filters?.account_type) {
      query = query.eq('account_type', filters.account_type);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
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
