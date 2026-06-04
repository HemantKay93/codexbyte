import { getAdminClient } from '../../config/supabase.js';

export interface ReportQueryFilters {
  startDate?: string;
  endDate?: string;
}

export class ReportingService {
  /**
   * Profit & Loss (Income Statement)
   * Revenues - Expenses
   */
  static async getProfitLoss(filters: ReportQueryFilters) {
    const admin = await getAdminClient();

    const { data: accounts, error: accErr } = await admin
      .from('accounts')
      .select('*')
      .in('type', ['Revenue', 'Expense']);

    if (accErr) throw new Error(accErr.message);

    let query = admin
      .from('journal_lines')
      .select(
        'account_id, debit_amount, credit_amount, journal_headers!inner(status, transaction_date)'
      )
      .eq('journal_headers.status', 'posted');

    if (filters.startDate) {
      query = query.gte('journal_headers.transaction_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('journal_headers.transaction_date', filters.endDate);
    }

    const { data: lines, error: linesErr } = await query;
    if (linesErr) throw new Error(linesErr.message);

    let totalRevenue = 0;
    let totalExpense = 0;
    const revenueBreakdown: Record<string, number> = {};
    const expenseBreakdown: Record<string, number> = {};

    accounts.forEach((acc: any) => {
      const accLines = lines.filter((l: any) => l.account_id === acc.id);
      const totalDebit = accLines.reduce((sum: number, l: any) => sum + Number(l.debit_amount), 0);
      const totalCredit = accLines.reduce(
        (sum: number, l: any) => sum + Number(l.credit_amount),
        0
      );

      let balance = 0;
      if (acc.type === 'Revenue') {
        balance = totalCredit - totalDebit; // Revenue is Credit normal
        totalRevenue += balance;
        revenueBreakdown[acc.name] = balance;
      } else if (acc.type === 'Expense') {
        balance = totalDebit - totalCredit; // Expense is Debit normal
        totalExpense += balance;
        expenseBreakdown[acc.name] = balance;
      }
    });

    return {
      total_revenue: totalRevenue,
      total_expense: totalExpense,
      net_profit: totalRevenue - totalExpense,
      breakdowns: {
        revenue: revenueBreakdown,
        expense: expenseBreakdown,
      },
    };
  }

  /**
   * Balance Sheet
   * Assets = Liabilities + Equity
   */
  static async getBalanceSheet(asOfDate?: string) {
    const admin = await getAdminClient();

    const { data: accounts, error: accErr } = await admin
      .from('accounts')
      .select('*')
      .in('type', ['Asset', 'Liability', 'Equity']);

    if (accErr) throw new Error(accErr.message);

    let query = admin
      .from('journal_lines')
      .select(
        'account_id, debit_amount, credit_amount, journal_headers!inner(status, transaction_date)'
      )
      .eq('journal_headers.status', 'posted');

    if (asOfDate) {
      query = query.lte('journal_headers.transaction_date', asOfDate);
    }

    const { data: lines, error: linesErr } = await query;
    if (linesErr) throw new Error(linesErr.message);

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    const assetBreakdown: Record<string, number> = {};
    const liabilityBreakdown: Record<string, number> = {};
    const equityBreakdown: Record<string, number> = {};

    accounts.forEach((acc: any) => {
      const accLines = lines.filter((l: any) => l.account_id === acc.id);
      const totalDebit = accLines.reduce((sum: number, l: any) => sum + Number(l.debit_amount), 0);
      const totalCredit = accLines.reduce(
        (sum: number, l: any) => sum + Number(l.credit_amount),
        0
      );

      let balance = 0;
      if (acc.type === 'Asset') {
        balance = totalDebit - totalCredit;
        totalAssets += balance;
        assetBreakdown[acc.name] = balance;
      } else if (acc.type === 'Liability') {
        balance = totalCredit - totalDebit;
        totalLiabilities += balance;
        liabilityBreakdown[acc.name] = balance;
      } else if (acc.type === 'Equity') {
        balance = totalCredit - totalDebit;
        totalEquity += balance;
        equityBreakdown[acc.name] = balance;
      }
    });

    // In a real Balance Sheet, you must calculate Retained Earnings (Net Income from P&L)
    // and add it to Equity if the books haven't been closed for the year.
    // For this prototype, we just calculate the pure P&L net income and add it as a line item to Equity.
    const pl = await this.getProfitLoss({ endDate: asOfDate });
    totalEquity += pl.net_profit;
    equityBreakdown['Retained Earnings (Current Year)'] = pl.net_profit;

    return {
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      total_equity: totalEquity,
      is_balanced: totalAssets === totalLiabilities + totalEquity,
      breakdowns: {
        assets: assetBreakdown,
        liabilities: liabilityBreakdown,
        equity: equityBreakdown,
      },
    };
  }
}
