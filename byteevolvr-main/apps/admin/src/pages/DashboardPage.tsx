import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui';
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Users, Activity, Loader2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { supabase } from '../lib/supabase';

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    salesCount: 0,
    customerCount: 0,
    avgOrderValue: 0
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // 1. Fetch Orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // 2. Fetch User Profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // 3. Process Stats
      const totalRevenue = orders?.reduce((acc, o) => acc + Number(o.total_amount), 0) || 0;
      const salesCount = orders?.length || 0;
      const avgOrderValue = salesCount > 0 ? totalRevenue / salesCount : 0;

      setStats({
        totalRevenue,
        salesCount,
        customerCount: profiles?.length || 0,
        avgOrderValue
      });

      // 4. Process Recent Sales (Combine manually)
      const mappedRecent = orders?.slice(0, 5).map(order => ({
        ...order,
        user_profiles: profiles?.find(p => p.id === order.user_id)
      })) || [];
      
      setRecentSales(mappedRecent);

      // 5. Process Chart Data (Last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const revenueByMonth: { [key: string]: number } = {};
      
      orders?.forEach(o => {
        const date = new Date(o.created_at);
        const monthName = months[date.getMonth()];
        revenueByMonth[monthName] = (revenueByMonth[monthName] || 0) + Number(o.total_amount);
      });

      const currentMonthIndex = new Date().getMonth();
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const idx = (currentMonthIndex - i + 12) % 12;
        const name = months[idx];
        last6Months.push({
          name,
          total: revenueByMonth[name] || 0
        });
      }

      setChartData(last6Months);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-on-surface-variant">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Syncing live dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-display-sm font-semibold text-on-background">Dashboard Overview</h1>
        <Badge variant="info">Live Sync: Active</Badge>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-on-surface-variant">Total Revenue</p>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12.5%
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-on-surface-variant">Total Orders</p>
              <ShoppingBag className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">+{stats.salesCount}</div>
              <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +8.2%
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-on-surface-variant">Total Customers</p>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">+{stats.customerCount}</div>
              <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +4.1%
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">lifetime unique users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-on-surface-variant">Avg. Order Value</p>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">₹{Math.round(stats.avgOrderValue).toLocaleString()}</div>
              <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +₹450
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B7BF8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B7BF8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#737686" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#737686" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e2ed" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--md-sys-color-surface-container)' }} 
                    itemStyle={{ color: 'var(--md-sys-color-primary)' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#3B7BF8" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentSales.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant italic">No recent sales found.</div>
              ) : recentSales.map((sale, i) => (
                <div key={i} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-primary-container text-primary flex items-center justify-center font-semibold text-sm">
                    {(sale.user_profiles?.full_name || 'G').charAt(0)}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none text-on-surface">{sale.user_profiles?.full_name || 'Walk-in Customer'}</p>
                    <p className="text-sm text-on-surface-variant truncate max-w-[150px]">{sale.user_profiles?.email || sale.order_number}</p>
                  </div>
                  <div className="ml-auto font-medium text-emerald-600">+₹{Number(sale.total_amount).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
