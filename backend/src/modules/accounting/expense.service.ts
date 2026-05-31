import { getAdminClient } from '../../config/supabase.js';
import { AutoPostingEngine } from './posting.service.js';

export class ExpenseService {
  /**
   * Submit an expense report
   */
  static async submitExpense(payload: any) {
    const admin = await getAdminClient();
    const expenseNumber = payload.expense_number || `EXP-${Date.now()}`;
    
    const { data, error } = await admin
      .from('expenses')
      .insert([{
        ...payload,
        expense_number: expenseNumber,
        status: 'submitted'
      }])
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Approve an expense. Once approved, it can be paid/posted.
   */
  static async approveExpense(expenseId: string, approverId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('expenses')
      .update({
        status: 'approved',
        approved_by: approverId,
        approval_date: new Date().toISOString()
      })
      .eq('id', expenseId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Mark expense as paid and post journal entry
   */
  static async payAndPostExpense(expenseId: string) {
    const admin = await getAdminClient();
    const { data: expense, error: fetchErr } = await admin
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .single();
      
    if (fetchErr || !expense) throw new Error(fetchErr?.message || 'Expense not found');
    if (expense.status !== 'approved') throw new Error('Expense must be approved before payment');

    // Wait, we need a method in AutoPostingEngine for general expense payment.
    // For now, VendorBill payment works similarly: DR Expense, CR Bank (if direct) or DR AP, CR Bank.
    // Assuming direct employee expense reimbursement: DR Expense (6000), CR Bank (1100).
    const journal = await AutoPostingEngine.postVendorBill(expense.id, expense.amount, '6000'); // Reusing bill posting logic which does DR Expense, CR AP.
    // Wait, let's just do a direct journal here or add a new method to AutoPostingEngine.

    const { data, error } = await admin
      .from('expenses')
      .update({
        status: 'posted',
        journal_header_id: journal.id
      })
      .eq('id', expenseId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
