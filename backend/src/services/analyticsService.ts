import { getAdminClient } from '../config/supabase.js';

export class AnalyticsService {
  static async getDashboardStats() {
    const admin = await getAdminClient();

    // 1. Total Revenue (Confirmed/Delivered orders)
    const { data: revenueData } = await admin
      .from('orders')
      .select('total_amount')
      .in('status', ['confirmed', 'packed', 'shipped', 'delivered']);

    const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

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
      .lt('quantity', 10); // Hardcoded threshold for now, could be dynamic

    const avgOrderValue = totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      salesCount: totalOrders || 0,
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
