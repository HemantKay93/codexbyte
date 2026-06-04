import { getAdminClient } from '../../config/supabase.js';
import logger from '../../services/logger.js';

export class ReportingService {
  static async getSalesDashboard(tenantId: string, startDate: string, endDate: string) {
    const admin = await getAdminClient();
    const { data: orders, error } = await admin
      .from('orders')
      .select('id, total_amount, status, created_at')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      logger.error('Error fetching sales report', error);
      throw error;
    }

    const totalRevenue =
      orders
        ?.filter((o: any) => o.status !== 'cancelled')
        .reduce((sum: number, o: any) => sum + Number(o.total_amount), 0) || 0;
    const totalOrders = orders?.length || 0;

    return { totalRevenue, totalOrders, orders };
  }

  static async getFinancialDashboard(tenantId: string, startDate: string, endDate: string) {
    const admin = await getAdminClient();

    // Aggregates over journal lines for Revenue and Expenses
    const { data: lines, error } = await admin
      .from('accounting_journal_lines')
      .select(
        `
        amount, 
        is_credit, 
        account:accounting_accounts(account_type),
        journal:accounting_journals(transaction_date)
      `
      )
      .eq('account.tenant_id', tenantId)
      .gte('journal.transaction_date', startDate)
      .lte('journal.transaction_date', endDate);

    if (error) throw error;

    let revenue = 0;
    let expenses = 0;

    (lines || []).forEach((line: any) => {
      if (!line.account || !line.journal) return; // Skip if join missed (e.g. out of date range)

      const type = line.account.account_type;
      if (type === 'revenue' && line.is_credit) revenue += Number(line.amount);
      if (type === 'expense' && !line.is_credit) expenses += Number(line.amount);
    });

    return { revenue, expenses, netProfit: revenue - expenses };
  }

  static async getInventoryReport(tenantId: string) {
    const admin = await getAdminClient();
    const { data: stock, error } = await admin
      .from('inventory_stock')
      .select('quantity, product:products(name, price)')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    let totalValuation = 0;
    const lowStockItems: any[] = [];

    (stock || []).forEach((item: any) => {
      const qty = Number(item.quantity);
      totalValuation += qty * (item.product?.price || 0);
      if (qty < 10) {
        lowStockItems.push({ name: item.product?.name, quantity: qty });
      }
    });

    return { totalValuation, lowStockItems, totalItems: stock?.length || 0 };
  }

  static async getCrmPipelineReport(tenantId: string) {
    const admin = await getAdminClient();
    const { data: leads, error } = await admin
      .from('crm_leads')
      .select('status, score')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    const funnel = {
      lead: 0,
      qualified: 0,
      proposal: 0,
      negotiation: 0,
      won: 0,
      lost: 0,
    };

    (leads || []).forEach((lead: any) => {
      if (funnel[lead.status as keyof typeof funnel] !== undefined) {
        funnel[lead.status as keyof typeof funnel]++;
      }
    });

    return { funnel, totalLeads: leads?.length || 0 };
  }
}
