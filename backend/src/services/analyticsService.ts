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

    const [currentPeriod, previousPeriod, revenueResult, totalOrdersResult, pendingOrdersResult, totalUsersResult, lowStockResult] = await Promise.all([
      getPeriodStats(lastMonth, now),
      getPeriodStats(twoMonthsAgo, lastMonth),
      admin.from('orders').select('total_amount').in('status', ['confirmed','packed','shipped','delivered']),
      admin.from('orders').select('*', { count: 'exact', head: true }),
      admin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      admin.from('user_profiles').select('*', { count: 'exact', head: true }),
      admin.from('inventory').select('*, products(name, sku)').lt('quantity', 10),
    ]);

    const revenueData = revenueResult.data;
    const totalOrders = totalOrdersResult.count;
    const pendingOrders = pendingOrdersResult.count;
    const totalUsers = totalUsersResult.count;
    const lowStock = lowStockResult.data;
    const totalRevenue = revenueData?.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0) || 0;

    const calculateDelta = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const revenueDelta = calculateDelta(currentPeriod.revenue, previousPeriod.revenue);
    const salesDelta = calculateDelta(currentPeriod.count, previousPeriod.count);

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

  static async getRevenueChart(months: number = 6) {
    const admin = await getAdminClient();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    // Set to first day of that month for complete coverage
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await admin
      .from('orders')
      .select('created_at, total_amount')
      .gte('created_at', startDate.toISOString())
      .in('status', ['confirmed', 'packed', 'shipped', 'delivered']);

    if (error) throw error;

    const grouped = (data || []).reduce((acc: Record<string, number>, order: any) => {
      const d = new Date(order.created_at);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      acc[monthStr] = (acc[monthStr] || 0) + (Number(order.total_amount) || 0);
      return acc;
    }, {});

    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      result.push({
        name: monthStr,
        total: grouped[monthStr] || 0
      });
    }
    return result;
  }

  static async recordEvent(type: string, payload: Record<string, any>) {
    // This function will be called by the analytics background worker
    // For now, it could save events to a dedicated Supabase analytics table
    // or push to a data warehouse.
    const admin = await getAdminClient();
    try {
      await admin.from('analytics_events').insert({
        event_type: type,
        payload,
      });
    } catch (err: any) {
      // Table might not exist yet, so we catch and log
      console.log(`[Analytics] Table 'analytics_events' might not exist:`, err.message);
    }
  }
}
