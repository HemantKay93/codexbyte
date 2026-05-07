import { supabase, getAdminClient } from '../config/supabase.js';

export class AdminRepository {
  async getStats() {
    const admin = await getAdminClient();

    // Total Revenue & Orders
    const { data: orders, error: ordersError } = await admin
      .from('orders')
      .select('total_amount, status, created_at, order_number');

    if (ordersError) throw ordersError;

    // Active Users
    const { count: userCount, error: userError } = await admin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (userError) throw userError;

    // Low Stock Alert
    const { data: lowStock, error: stockError } = await admin
      .from('products')
      .select('name, stock_quantity')
      .lt('stock_quantity', 10);

    if (stockError) throw stockError;

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;

    return {
      totalRevenue,
      salesCount: orders.length,
      customerCount: userCount || 0,
      avgOrderValue,
      pendingOrders,
      lowStockAlerts: lowStock || [],
      recentOrders: orders.slice(0, 5),
    };
  }

  async getCustomers() {
    const admin = await getAdminClient();
    const { data: profiles, error: profilesError } = await admin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    const { data: orders, error: ordersError } = await admin
      .from('orders')
      .select('user_id, total_amount');

    if (ordersError) throw ordersError;

    return profiles.map((profile) => {
      const userOrders = orders.filter((o) => o.user_id === profile.id);
      const totalSpent = userOrders.reduce((acc, o) => acc + Number(o.total_amount), 0);
      return {
        ...profile,
        orderCount: userOrders.length,
        totalSpent,
      };
    });
  }

  async getCustomerDetail(id: string) {
    const admin = await getAdminClient();

    // 1. Profile
    const { data: profile, error: profileError } = await admin
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (profileError) throw profileError;

    // 2. Orders
    const { data: orders, error: ordersError } = await admin
      .from('orders')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });
    if (ordersError) throw ordersError;

    // 3. Addresses
    const { data: addresses, error: addressError } = await admin
      .from('addresses')
      .select('*')
      .eq('user_id', id);
    if (addressError) throw addressError;

    // 4. Reviews Count
    const { count: reviewsCount, error: reviewsError } = await admin
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    return {
      profile,
      orders: orders || [],
      addresses: addresses || [],
      reviewsCount: reviewsCount || 0,
    };
  }

  async getSalesAnalytics(period: string = '30days') {
    const admin = await getAdminClient();

    let query = admin
      .from('orders')
      .select('total_amount, created_at')
      .order('created_at', { ascending: true });

    // Handle period filtering
    const now = new Date();
    if (period === '7days') {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
      query = query.gte('created_at', sevenDaysAgo);
    } else if (period === '30days') {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).toISOString();
      query = query.gte('created_at', thirtyDaysAgo);
    } else if (period === 'year') {
      const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      query = query.gte('created_at', oneYearAgo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getWarehouseTasks() {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('order_items')
      .select(
        `
        *,
        order:order_id (
          order_number,
          status
        ),
        product:product_id (
          name
        )
      `
      )
      .in('order.status', ['processing', 'confirmed'])
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data?.filter((item: any) => item.order) || [];
  }
}
