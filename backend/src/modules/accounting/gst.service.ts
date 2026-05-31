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

    // In a real implementation, we would query `invoice_line_items` and `vendor_bill_lines` 
    // for the given month, aggregating CGST, SGST, IGST.
    // For this prototype, we will create a dummy draft based on total ledger balances in GST accounts.

    // Calculate total Sales (Revenue) and Purchases (Expenses) for the month
    // We can query journal_lines for accounts 4000 (Revenue) and 6000 (Expenses)
    
    // For now, we will create a draft record in `gst_returns`
    const { data: existing, error: existErr } = await admin
      .from('gst_returns')
      .select('*')
      .eq('return_type', 'GSTR-3B')
      .eq('month', month)
      .eq('financial_year', year)
      .single();

    if (existing) {
      return existing; // Return existing draft
    }

    // Create a new draft
    const { data, error } = await admin
      .from('gst_returns')
      .insert([{
        return_type: 'GSTR-3B',
        month,
        financial_year: year,
        status: 'draft',
        total_sales: 500000.00, // Dummy data for prototype
        total_purchases: 300000.00,
        total_cgst: 45000.00,
        total_sgst: 45000.00,
        total_igst: 0.00
      }])
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
        filed_on: new Date().toISOString()
      })
      .eq('id', returnId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
