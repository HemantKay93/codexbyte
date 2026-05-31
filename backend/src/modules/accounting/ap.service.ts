import { getAdminClient } from '../../config/supabase.js';

export class APService {
  /**
   * Retrieves the Accounts Payable aging report.
   * Buckets outstanding vendor bills by days overdue:
   * Current (not due), 1-30, 31-60, 61-90, 90+ days.
   */
  static async getAgingReport() {
    const admin = await getAdminClient();
    
    const { data: bills, error } = await admin
      .from('vendor_bills')
      .select('id, bill_number, vendor_name, due_date, outstanding_amount')
      .gt('outstanding_amount', 0)
      .not('status', 'eq', 'cancelled');

    if (error) throw new Error(error.message);

    const report = {
      current: 0,
      '1_30': 0,
      '31_60': 0,
      '61_90': 0,
      '90_plus': 0,
      total_outstanding: 0,
      vendor_breakdown: {} as Record<string, any>
    };

    const now = new Date();
    
    for (const bill of bills) {
      const dueDate = new Date(bill.due_date);
      const diffTime = now.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const amount = Number(bill.outstanding_amount);
      report.total_outstanding += amount;
      
      if (!report.vendor_breakdown[bill.vendor_name]) {
        report.vendor_breakdown[bill.vendor_name] = { total: 0, current: 0, '1_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0 };
      }
      
      report.vendor_breakdown[bill.vendor_name].total += amount;

      if (diffDays <= 0) {
        report.current += amount;
        report.vendor_breakdown[bill.vendor_name].current += amount;
      } else if (diffDays <= 30) {
        report['1_30'] += amount;
        report.vendor_breakdown[bill.vendor_name]['1_30'] += amount;
      } else if (diffDays <= 60) {
        report['31_60'] += amount;
        report.vendor_breakdown[bill.vendor_name]['31_60'] += amount;
      } else if (diffDays <= 90) {
        report['61_90'] += amount;
        report.vendor_breakdown[bill.vendor_name]['61_90'] += amount;
      } else {
        report['90_plus'] += amount;
        report.vendor_breakdown[bill.vendor_name]['90_plus'] += amount;
      }
    }

    return report;
  }

  static async getVendorLedger(vendorId: string) {
    const admin = await getAdminClient();
    const { data: bills, error } = await admin
      .from('vendor_bills')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    const totalOutstanding = bills.reduce((sum: number, b: any) => sum + Number(b.outstanding_amount), 0);
    const totalPaid = bills.reduce((sum: number, b: any) => sum + Number(b.paid_amount), 0);

    return {
      bills,
      metrics: {
        totalOutstanding,
        totalPaid
      }
    };
  }
}
