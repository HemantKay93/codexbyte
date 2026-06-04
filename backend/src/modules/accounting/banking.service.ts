import { getAdminClient } from '../../config/supabase.js';

import { AccountingRepository } from './accounting.repository.js';

export class BankingService {
  /**
   * Registers a new bank account and links it to the CoA.
   * Typically links to Asset -> Bank Account (e.g. 1100).
   */
  static async createBankAccount(payload: any) {
    const admin = await getAdminClient();

    // Validate account mapping (must exist in CoA)
    const { data: account, error: accError } = await admin
      .from('accounts')
      .select('id, type')
      .eq('id', payload.account_id)
      .single();

    if (accError || !account) throw new Error('Invalid Chart of Account mapping');
    if (account.type !== 'Asset')
      throw new Error('Bank accounts must map to an Asset account in the CoA');

    const { data, error } = await admin
      .from('bank_accounts')
      .insert([payload])
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Records a bank transaction (deposit or withdrawal)
   * and auto-posts it to the ledger.
   */
  static async recordTransaction(bankAccountId: string, payload: any) {
    const admin = await getAdminClient();

    // 1. Get the Bank Account to know the CoA ID
    const { data: bankAcc, error: bErr } = await admin
      .from('bank_accounts')
      .select('*')
      .eq('id', bankAccountId)
      .single();

    if (bErr || !bankAcc) throw new Error('Bank account not found');

    // 2. Validate opposite account mapping (e.g. Income or Expense)
    if (!payload.offset_account_id)
      throw new Error('Must provide an offset account ID to balance the transaction');

    // 3. Post Journal
    const isDeposit = payload.transaction_type === 'deposit';
    const debitAccount = isDeposit ? bankAcc.account_id : payload.offset_account_id;
    const creditAccount = isDeposit ? payload.offset_account_id : bankAcc.account_id;

    const amount = Number(payload.amount);

    const journal = await AccountingRepository.createDoubleEntryJournal(
      {
        transaction_date: payload.transaction_date || new Date().toISOString(),
        description: payload.description || 'Manual Bank Transaction',
        reference_type: 'bank_transaction',
        status: 'posted',
      },
      [
        { account_id: debitAccount, debit_amount: amount, credit_amount: 0 },
        { account_id: creditAccount, debit_amount: 0, credit_amount: amount },
      ]
    );

    // 4. Create the physical bank_transaction record
    const { data: txn, error: tErr } = await admin
      .from('bank_transactions')
      .insert([
        {
          bank_account_id: bankAccountId,
          transaction_date: payload.transaction_date || new Date().toISOString(),
          description: payload.description,
          reference_number: payload.reference_number,
          transaction_type: payload.transaction_type,
          amount: amount,
          journal_header_id: journal.id,
          status: 'reconciled', // Manual entries are usually self-reconciled, but could be 'unreconciled'
        },
      ])
      .select('*')
      .single();

    if (tErr) throw new Error(tErr.message);

    // 5. Update Bank Account Balance
    const newBalance = isDeposit
      ? Number(bankAcc.current_balance) + amount
      : Number(bankAcc.current_balance) - amount;
    await admin
      .from('bank_accounts')
      .update({ current_balance: newBalance })
      .eq('id', bankAccountId);

    return txn;
  }

  static async getBankAccounts() {
    const admin = await getAdminClient();
    const { data, error } = await admin.from('bank_accounts').select('*, accounts(code, name)');
    if (error) throw new Error(error.message);
    return data;
  }
}
