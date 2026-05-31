import { getAdminClient } from '../../config/supabase.js';

export class ARService {
  /**
   * Retrieves the Accounts Receivable aging report.
   * Buckets outstanding invoices by days overdue:
   * Current (not due), 1-30, 31-60, 61-90, 90+ days.
   */
  static async getAgingReport() {
    const admin = await getAdminClient();
    
    // Get all outstanding invoices
    const { data: invoices, error } = await admin
      .from('invoices')
      .select('id, invoice_number, customer_name, due_date, outstanding_amount')
      .gt('outstanding_amount', 0)
      .not('status', 'eq', 'cancelled')
      .not('status', 'eq', 'write_off');

    if (error) throw new Error(error.message);

    const report = {
      current: 0,
      '1_30': 0,
      '31_60': 0,
      '61_90': 0,
      '90_plus': 0,
      total_outstanding: 0,
      customer_breakdown: {} as Record<string, any>
    };

    const now = new Date();
    
    for (const inv of invoices) {
      const dueDate = new Date(inv.due_date);
      const diffTime = now.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const amount = Number(inv.outstanding_amount);
      report.total_outstanding += amount;
      
      if (!report.customer_breakdown[inv.customer_name]) {
        report.customer_breakdown[inv.customer_name] = { total: 0, current: 0, '1_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0 };
      }
      
      report.customer_breakdown[inv.customer_name].total += amount;

      if (diffDays <= 0) {
        report.current += amount;
        report.customer_breakdown[inv.customer_name].current += amount;
      } else if (diffDays <= 30) {
        report['1_30'] += amount;
        report.customer_breakdown[inv.customer_name]['1_30'] += amount;
      } else if (diffDays <= 60) {
        report['31_60'] += amount;
        report.customer_breakdown[inv.customer_name]['31_60'] += amount;
      } else if (diffDays <= 90) {
        report['61_90'] += amount;
        report.customer_breakdown[inv.customer_name]['61_90'] += amount;
      } else {
        report['90_plus'] += amount;
        report.customer_breakdown[inv.customer_name]['90_plus'] += amount;
      }
    }

    return report;
  }

  static async getCustomerLedger(customerId: string) {
    const admin = await getAdminClient();
    const { data: invoices, error } = await admin
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    const totalOutstanding = invoices.reduce((sum: number, inv: any) => sum + Number(inv.outstanding_amount), 0);
    const totalPaid = invoices.reduce((sum: number, inv: any) => sum + Number(inv.paid_amount), 0);

    return {
      invoices,
      metrics: {
        totalOutstanding,
        totalPaid
      }
    };
  }
}
