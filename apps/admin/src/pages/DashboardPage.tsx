import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../components/ui';
import { ArrowUpRight, DollarSign, ShoppingBag, Users, Activity, Loader2 } from 'lucide-react';
import { useAdmin } from '../modules/admin/hooks/useAdmin';
import { SocketService } from '@byteevolvr/api-client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function DashboardPage() {
  const { stats, recentSales, chartData, isLoading, error, fetchDashboardData } = useAdmin();

  useEffect(() => {
    fetchDashboardData();

    // Real-time updates for Admin
    const socket = SocketService.connect('admin-session');

    socket.on('admin:new_order', (data: any) => {
      console.log('[Socket] New order detected:', data);
      fetchDashboardData();
    });

    socket.on('admin:order_status_change', (data: any) => {
      console.log('[Socket] Order status changed:', data);
      fetchDashboardData();
    });

    return () => {
      SocketService.disconnect();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-on-surface-variant">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Syncing live dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-on-surface-variant p-6">
        <div className="bg-error/10 border border-error p-6 rounded-2xl max-w-md text-center">
          <p className="text-error font-bold mb-2">Sync Error</p>
          <p className="text-sm mb-4">{error}</p>
          <Button onClick={() => fetchDashboardData()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Ensure stats object exists with defaults
  const displayStats = {
    totalRevenue: Number(stats?.totalRevenue || 0),
    revenueDelta: Number(stats?.revenueDelta || 0),
    salesCount: Number(stats?.salesCount || 0),
    salesDelta: Number(stats?.salesDelta || 0),
    customerCount: Number(stats?.customerCount || 0),
    avgOrderValue: Number(stats?.avgOrderValue || 0),
  };

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
              <div className="text-2xl font-bold">
                ₹{displayStats.totalRevenue.toLocaleString()}
              </div>
              <div
                className={`flex items-center text-xs px-2 py-1 rounded-full ${displayStats.revenueDelta >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}
              >
                {displayStats.revenueDelta >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 mr-1 rotate-90" />
                )}
                {Math.abs(displayStats.revenueDelta).toFixed(1)}%
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
              <div className="text-2xl font-bold">+{displayStats.salesCount}</div>
              <div
                className={`flex items-center text-xs px-2 py-1 rounded-full ${displayStats.salesDelta >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}
              >
                {displayStats.salesDelta >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 mr-1 rotate-90" />
                )}
                {Math.abs(displayStats.salesDelta).toFixed(1)}%
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
              <div className="text-2xl font-bold">+{displayStats.customerCount}</div>
              <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Active
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
              <div className="text-2xl font-bold">
                ₹{Math.round(displayStats.avgOrderValue).toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Target
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
                      <stop offset="5%" stopColor="#3B7BF8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B7BF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#737686"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#737686"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e2ed" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'var(--md-sys-color-surface-container)',
                    }}
                    itemStyle={{ color: 'var(--md-sys-color-primary)' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3B7BF8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
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
              {!Array.isArray(recentSales) || recentSales.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant italic">
                  No recent sales found.
                </div>
              ) : (
                recentSales.map((sale: any, i: number) => (
                  <div key={i} className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-primary-container text-primary flex items-center justify-center font-semibold text-sm">
                      {(sale.user_profiles?.full_name || 'G').charAt(0)}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none text-on-surface">
                        {sale.user_profiles?.full_name || 'Walk-in Customer'}
                      </p>
                      <p className="text-sm text-on-surface-variant truncate max-w-[150px]">
                        {sale.user_profiles?.email || sale.order_number}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-emerald-600">
                      +₹{Number(sale.total_amount).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
