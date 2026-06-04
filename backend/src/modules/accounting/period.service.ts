import { getAdminClient } from '../../config/supabase.js';

export class PeriodService {
  /**
   * Check if a specific date falls into a closed period.
   * If it does, throw an error. This is a locking mechanism.
   */
  static async validatePeriodIsOpen(transactionDate: string) {
    const admin = await getAdminClient();

    const { data: closedPeriods, error } = await admin
      .from('financial_periods')
      .select('*')
      .eq('status', 'closed')
      .lte('start_date', transactionDate)
      .gte('end_date', transactionDate);

    if (error) throw new Error(error.message);

    if (closedPeriods && closedPeriods.length > 0) {
      throw new Error(
        `Transaction date ${transactionDate} falls in a closed financial period: ${closedPeriods[0].name}`
      );
    }

    return true;
  }

  /**
   * Close a financial period
   */
  static async closePeriod(periodId: string, userId: string) {
    const admin = await getAdminClient();

    const { data, error } = await admin
      .from('financial_periods')
      .update({
        status: 'closed',
        closed_by: userId,
        closed_at: new Date().toISOString(),
      })
      .eq('id', periodId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * List all periods
   */
  static async getPeriods() {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('financial_periods')
      .select('*')
      .order('start_date', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }
}
