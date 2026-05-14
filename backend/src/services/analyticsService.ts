import { getAdminClient } from '../config/supabase.js';

export class AnalyticsService {
  static async getDashboardStats() {
    const admin = await getAdminClient();

    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Helper for period stats
    const getPeriodStats = async (start: Date, end: Date) => {
      const { data: revenueData } = await admin
        .from('orders')
        .select('total_amount')
        .gte('created_at', start.toISOString())
        .lt('created_at', end.toISOString())
        .in('status', ['confirmed', 'packed', 'shipped', 'delivered']);

      const revenue =
        revenueData?.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0) || 0;
      const count = revenueData?.length || 0;
      return { revenue, count };
    };

    const currentPeriod = await getPeriodStats(lastMonth, now);
    const previousPeriod = await getPeriodStats(twoMonthsAgo, lastMonth);

    // 1. Total Revenue (Confirmed/Delivered orders)
    const { data: revenueData } = await admin
      .from('orders')
      .select('total_amount')
      .in('status', ['confirmed', 'packed', 'shipped', 'delivered']);

    const totalRevenue =
      revenueData?.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0) || 0;

    const calculateDelta = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const revenueDelta = calculateDelta(currentPeriod.revenue, previousPeriod.revenue);
    const salesDelta = calculateDelta(currentPeriod.count, previousPeriod.count);

    // 2. Order Counts
    const { count: totalOrders } = await admin
      .from('orders')
      .select('*', { count: 'exact', head: true });
    const { count: pendingOrders } = await admin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // 3. User Counts
    const { count: totalUsers } = await admin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // 4. Low Stock Alerts
    const { data: lowStock } = await admin
      .from('inventory')
      .select('*, products(name, sku)')
      .lt('quantity', 10);

    const avgOrderValue = totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      revenueDelta,
      salesCount: totalOrders || 0,
      salesDelta,
      pendingOrders: pendingOrders || 0,
      customerCount: totalUsers || 0,
      avgOrderValue,
      lowStockAlertsCount: lowStock?.length || 0,
      lowStockItems: lowStock || [],
    };
  }

  static async getSalesTrend(days: number = 7) {
    const admin = await getAdminClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await admin
      .from('orders')
      .select('created_at, total_amount')
      .gte('created_at', startDate.toISOString())
      .in('status', ['confirmed', 'packed', 'shipped', 'delivered'])
      .order('created_at');

    if (error) throw error;
    return data;
  }
}
