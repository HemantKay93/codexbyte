import { getAdminClient } from '../../config/supabase.js';

export class ReconciliationService {
  /**
   * Fetch all unreconciled bank transactions for a specific bank account
   */
  static async getUnreconciledTransactions(bankAccountId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('bank_transactions')
      .select('*')
      .eq('bank_account_id', bankAccountId)
      .eq('status', 'unreconciled')
      .order('transaction_date', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Manually reconcile a bank transaction against a journal entry
   */
  static async reconcileTransaction(bankTransactionId: string, journalHeaderId: string) {
    const admin = await getAdminClient();

    // In a real ERP, we would verify amounts match, dates are close, etc.
    // For this prototype, we just link them and mark as reconciled.

    const { data, error } = await admin
      .from('bank_transactions')
      .update({
        status: 'reconciled',
        journal_header_id: journalHeaderId,
      })
      .eq('id', bankTransactionId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
