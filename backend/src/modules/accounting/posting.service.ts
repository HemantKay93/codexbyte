import { AccountingRepository } from './accounting.repository.js';

/**
 * AutoPostingEngine
 * Automatically generates balanced double-entry journals for various ERP events.
 */
export class AutoPostingEngine {
  private static async getAccountIds(codes: string[]) {
    const ids: Record<string, string> = {};
    for (const code of codes) {
      const account = await AccountingRepository.getAccountByCode(code);
      ids[code] = account.id;
    }
    return ids;
  }

  static async postOrderCreated(orderId: string, amount: number) {
    // DR Accounts Receivable (1200)
    // CR Sales Revenue (4000)
    const acc = await this.getAccountIds(['1200', '4000']);
    
    return AccountingRepository.createDoubleEntryJournal(
      {
        transaction_date: new Date().toISOString(),
        description: `Order Created - ${orderId}`,
        reference_type: 'order',
        reference_id: orderId,
        status: 'posted',
      },
      [
        { account_id: acc['1200'], debit_amount: amount, credit_amount: 0 },
        { account_id: acc['4000'], debit_amount: 0, credit_amount: amount },
      ]
    );
  }

  static async postPaymentReceived(paymentId: string, orderId: string, amount: number) {
    // DR Bank (1100)
    // CR Accounts Receivable (1200)
    const acc = await this.getAccountIds(['1100', '1200']);

    return AccountingRepository.createDoubleEntryJournal(
      {
        transaction_date: new Date().toISOString(),
        description: `Payment Received for Order - ${orderId}`,
        reference_type: 'payment',
        reference_id: paymentId,
        status: 'posted',
      },
      [
        { account_id: acc['1100'], debit_amount: amount, credit_amount: 0 },
        { account_id: acc['1200'], debit_amount: 0, credit_amount: amount },
      ]
    );
  }

  static async postRefundIssued(refundId: string, amount: number) {
    // DR Refund Expense (6200)
    // CR Bank (1100)
    const acc = await this.getAccountIds(['6200', '1100']);

    return AccountingRepository.createDoubleEntryJournal(
      {
        transaction_date: new Date().toISOString(),
        description: `Refund Issued - ${refundId}`,
        reference_type: 'payment', // using payment as reference type for refunds too
        reference_id: refundId,
        status: 'posted',
      },
      [
        { account_id: acc['6200'], debit_amount: amount, credit_amount: 0 },
        { account_id: acc['1100'], debit_amount: 0, credit_amount: amount },
      ]
    );
  }

  static async postVendorBill(billId: string, amount: number, expenseAccountCode: string = '6000') {
    // DR Expense (Dynamic or 6000)
    // CR Accounts Payable (2000)
    const acc = await this.getAccountIds([expenseAccountCode, '2000']);

    return AccountingRepository.createDoubleEntryJournal(
      {
        transaction_date: new Date().toISOString(),
        description: `Vendor Bill - ${billId}`,
        reference_type: 'bill',
        reference_id: billId,
        status: 'posted',
      },
      [
        { account_id: acc[expenseAccountCode], debit_amount: amount, credit_amount: 0 },
        { account_id: acc['2000'], debit_amount: 0, credit_amount: amount },
      ]
    );
  }

  static async postVendorPayment(paymentId: string, billId: string, amount: number) {
    // DR Accounts Payable (2000)
    // CR Bank (1100)
    const acc = await this.getAccountIds(['2000', '1100']);

    return AccountingRepository.createDoubleEntryJournal(
      {
        transaction_date: new Date().toISOString(),
        description: `Vendor Payment for Bill - ${billId}`,
        reference_type: 'payment',
        reference_id: paymentId,
        status: 'posted',
      },
      [
        { account_id: acc['2000'], debit_amount: amount, credit_amount: 0 },
        { account_id: acc['1100'], debit_amount: 0, credit_amount: amount },
      ]
    );
  }

  static async postEmployeeExpense(expenseId: string, amount: number) {
    // DR Operating Expenses (6000)
    // CR Bank (1100)
    const acc = await this.getAccountIds(['6000', '1100']);

    return AccountingRepository.createDoubleEntryJournal(
      {
        transaction_date: new Date().toISOString(),
        description: `Employee Expense Reimbursement - ${expenseId}`,
        reference_type: 'expense',
        reference_id: expenseId,
        status: 'posted',
      },
      [
        { account_id: acc['6000'], debit_amount: amount, credit_amount: 0 },
        { account_id: acc['1100'], debit_amount: 0, credit_amount: amount },
      ]
    );
  }
}
