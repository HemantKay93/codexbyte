import { useState, useEffect } from 'react';
import { Card, Button } from '@byteevolvr/ui';;
import {
  Download,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Loader2,
  RefreshCcw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { AdminService } from '@byteevolvr/api-client';

export function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ revenue: 0, orders: 0, customers: 0, avgValue: 0 });
  const [salesData, setSalesData] = useState<{ name: string; revenue: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; sales: number }[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      // 1. Fetch data from AdminService
      const stats = await AdminService.getDashboardStats();
      const orders = await AdminService.getOrders();
      await AdminService.getCustomers();

      // 3. Process Metrics
      setMetrics({
        revenue: stats.totalRevenue || 0,
        orders: stats.salesCount || 0,
        customers: stats.customerCount || 0,
        avgValue: stats.avgOrderValue || 0,
      });

      // 4. Process Revenue Over Time (Daily)
      const last7Days: { name: string; revenue: number }[] = [];

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        const dateStr = d.toISOString().split('T')[0];

        const dayRevenue =
          orders
            ?.filter((o: any) => o.created_at.startsWith(dateStr))
            .reduce((sum: number, o: any) => sum + Number(o.total_amount), 0) || 0;

        last7Days.push({ name: dayName, revenue: dayRevenue });
      }
      setSalesData(last7Days);

      // 5. Process Top Products (This would ideally come from a specialized backend route)
      // For now, we'll use a mock or process from orders if items are available
      const productSales: { [key: string]: number } = {};
      orders?.forEach((order: any) => {
        order.order_items?.forEach((item: { product_name: string; quantity: number }) => {
          productSales[item.product_name] = (productSales[item.product_name] || 0) + item.quantity;
        });
      });

      const sortedProducts = Object.entries(productSales)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      setTopProducts(
        sortedProducts.length > 0 ? sortedProducts : [{ name: 'Loading data...', sales: 0 }]
      );
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-on-surface-variant">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Compiling business intelligence reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Analytics & Reports</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Track your store's performance and growth
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={fetchAnalytics}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm uppercase tracking-wider">Total Revenue</span>
            </div>
            <div className="text-3xl font-bold text-on-surface">
              ₹{metrics.revenue.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Live cumulative sales
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm uppercase tracking-wider">Total Orders</span>
            </div>
            <div className="text-3xl font-bold text-on-surface">
              {metrics.orders.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Successful transactions
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm uppercase tracking-wider">Unique Customers</span>
            </div>
            <div className="text-3xl font-bold text-on-surface">{metrics.customers}</div>
            <div className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Verified user profiles
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm uppercase tracking-wider">Avg. Order Value</span>
            </div>
            <div className="text-3xl font-bold text-on-surface">
              ₹{Math.round(metrics.avgValue).toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Revenue per order
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="p-6 border-b border-outline-variant">
            <h2 className="text-lg font-semibold text-on-surface">Revenue Trend (Last 7 Days)</h2>
          </div>
          <div className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B7BF8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B7BF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'var(--md-sys-color-surface-container-high)',
                    }}
                    itemStyle={{ color: 'var(--md-sys-color-primary)', fontWeight: 600 }}
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B7BF8"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 border-b border-outline-variant">
            <h2 className="text-lg font-semibold text-on-surface">Top Selling Products</h2>
          </div>
          <div className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#4b5563"
                    fontSize={10}
                    width={100}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 123, 248, 0.1)' }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="sales" fill="#3B7BF8" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
