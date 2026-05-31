import { getAdminClient } from '../../config/supabase.js';

export interface LedgerQueryFilters {
  accountId?: string;
  startDate?: string;
  endDate?: string;
}

export class LedgerService {
  /**
   * Generates a General Ledger report with running balances for a specific account.
   */
  static async getAccountLedger(filters: LedgerQueryFilters) {
    if (!filters.accountId) {
      throw new Error('Account ID is required to fetch ledger');
    }

    const admin = await getAdminClient();

    // 1. Get the account details
    const { data: account, error: accError } = await admin
      .from('accounts')
      .select('*')
      .eq('id', filters.accountId)
      .single();

    if (accError) throw new Error(`Error fetching account: ${accError.message}`);

    // 2. Fetch the journal lines for this account
    let query = admin
      .from('journal_lines')
      .select(`
        id,
        debit_amount,
        credit_amount,
        created_at,
        journal_header_id,
        journal_headers (
          transaction_date,
          description,
          reference_type,
          reference_id
        )
      `)
      .eq('account_id', filters.accountId)
      .order('created_at', { ascending: true }); // Need chronological order for running balance

    if (filters.startDate) {
      // Need to cast to inner join column filter in Supabase if needed, 
      // but simpler to filter by created_at of the line for now, or use a view.
      // Since journal_headers holds transaction_date, doing it at the API layer 
      // or using PostgREST embedding filters.
      query = query.gte('journal_headers.transaction_date', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('journal_headers.transaction_date', filters.endDate);
    }

    const { data: lines, error: linesError } = await query;
    if (linesError) throw new Error(`Error fetching ledger lines: ${linesError.message}`);

    // 3. Calculate running balance
    // Asset/Expense: Normal Balance is Debit (Debit - Credit)
    // Liability/Equity/Revenue: Normal Balance is Credit (Credit - Debit)
    const isDebitNormal = account.type === 'Asset' || account.type === 'Expense';

    let runningBalance = 0;
    
    const transactions = lines
      // Filter out null headers (due to Supabase inner join limitations on outer filters sometimes)
      .filter((line: any) => line.journal_headers !== null)
      .map((line: any) => {
        const debit = Number(line.debit_amount) || 0;
        const credit = Number(line.credit_amount) || 0;
        
        if (isDebitNormal) {
          runningBalance += (debit - credit);
        } else {
          runningBalance += (credit - debit);
        }

        return {
          id: line.id,
          journal_header_id: line.journal_header_id,
          date: line.journal_headers.transaction_date,
          description: line.journal_headers.description,
          reference_type: line.journal_headers.reference_type,
          reference_id: line.journal_headers.reference_id,
          debit,
          credit,
          balance: runningBalance
        };
      });

    return {
      account,
      transactions,
      ending_balance: runningBalance,
      is_debit_normal: isDebitNormal
    };
  }

  /**
   * Fetch Trial Balance (Aggregated balances for all accounts)
   * We will fully flesh this out in Phase 11 (Financial Reporting), 
   * but it's fundamentally a ledger operation.
   */
  static async getTrialBalance(asOfDate?: string) {
    const admin = await getAdminClient();
    
    // In a real ERP, you'd use a SQL View or RPC to sum this up efficiently.
    // For now, we fetch aggregated sums per account.
    const { data: accounts, error: accError } = await admin.from('accounts').select('*');
    if (accError) throw new Error(accError.message);

    const { data: lines, error: linesError } = await admin
      .from('journal_lines')
      .select('account_id, debit_amount, credit_amount, journal_headers(status, transaction_date)');

    if (linesError) throw new Error(linesError.message);

    const activeLines = lines.filter((l: any) => l.journal_headers?.status === 'posted');
    
    const trialBalance = accounts.map((acc: any) => {
      const accLines = activeLines.filter((l: any) => l.account_id === acc.id);
      const totalDebit = accLines.reduce((sum: number, l: any) => sum + Number(l.debit_amount), 0);
      const totalCredit = accLines.reduce((sum: number, l: any) => sum + Number(l.credit_amount), 0);
      
      let balance = 0;
      if (acc.type === 'Asset' || acc.type === 'Expense') {
        balance = totalDebit - totalCredit;
      } else {
        balance = totalCredit - totalDebit;
      }

      return {
        ...acc,
        totalDebit,
        totalCredit,
        balance
      };
    });

    return trialBalance;
  }
}
