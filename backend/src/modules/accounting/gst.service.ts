import { getAdminClient } from '../../config/supabase.js';

export class GSTService {
  /**
   * Fetches all configured tax rates
   */
  static async getTaxRates() {
    const admin = await getAdminClient();
    const { data, error } = await admin.from('tax_rates').select('*').eq('is_active', true);
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Prepares a draft GSTR-3B return for a given month and year
   * GSTR-3B is a monthly summary return.
   */
  static async prepareGSTR3B(month: string, year: string) {
    const admin = await getAdminClient();

    // Fetch aggregate Profit/Loss for total sales and purchases
    const pl = await admin
      .from('accounting_journal_lines')
      .select('debit_amount, credit_amount, accounting_accounts!inner(type)')
      .eq('accounting_journals.tenant_id', '00000000-0000-0000-0000-000000000000') // Placeholder for single tenant context if not passed
      .in('accounting_accounts.type', ['revenue', 'expense']);

    let totalSales = 0;
    let totalPurchases = 0;

    if (pl.data) {
      for (const line of pl.data as any[]) {
        const debit = Number(line.debit_amount || 0);
        const credit = Number(line.credit_amount || 0);
        if (line.accounting_accounts.type === 'revenue') {
          totalSales += credit - debit;
        } else if (line.accounting_accounts.type === 'expense') {
          totalPurchases += debit - credit;
        }
      }
    }

    // Estimate GST as 18% of Net for prototype, separated into CGST/SGST
    const netGst = totalSales * 0.18;
    const total_cgst = netGst / 2;
    const total_sgst = netGst / 2;

    // Create a new draft
    const { data, error } = await admin
      .from('gst_returns')
      .insert([
        {
          return_type: 'GSTR-3B',
          month,
          financial_year: year,
          status: 'draft',
          total_sales: totalSales,
          total_purchases: totalPurchases,
          total_cgst: total_cgst,
          total_sgst: total_sgst,
          total_igst: 0.0,
        },
      ])
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * File a GST Return
   */
  static async fileReturn(returnId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('gst_returns')
      .update({
        status: 'filed',
        filed_on: new Date().toISOString(),
      })
      .eq('id', returnId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
