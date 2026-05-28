import { useEffect } from 'react';
import { Badge, Button } from '@byteevolvr/ui';
import { Loader2 } from 'lucide-react';
import { SocketService } from '@byteevolvr/api-client';

import { useAdmin } from '../modules/admin/hooks/useAdmin';

import { SystemHealthWidget } from './dashboard-components/SystemHealthWidget';
import { DashboardMetricsRow } from './dashboard-components/DashboardMetricsRow';
import { DashboardOperationalInsights } from './dashboard-components/DashboardOperationalInsights';
import { RevenueChartWidget } from './dashboard-components/RevenueChartWidget';
import { RecentSalesWidget } from './dashboard-components/RecentSalesWidget';

export function DashboardPage() {
  const { stats, recentSales, chartData, isLoading, error, fetchDashboardData } = useAdmin();

  useEffect(() => {
    void fetchDashboardData();

    // Real-time updates for Admin
    const socket = SocketService.connect('admin-session');

    socket.on('admin:new_order', () => {
      void fetchDashboardData();
    });

    socket.on('admin:order_status_change', () => {
      void fetchDashboardData();
    });

    return () => {
      SocketService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <Button onClick={() => void fetchDashboardData()}>Try Again</Button>
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
    pendingOrders: Number(stats?.pendingOrders || 0),
    lowStockAlertsCount: Number(stats?.lowStockAlertsCount || 0),
    lowStockItems: stats?.lowStockItems || [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-display-sm font-semibold text-on-background">Dashboard Overview</h1>
        <Badge variant="primary">Live Sync: Active</Badge>
      </div>

      <DashboardMetricsRow displayStats={displayStats} />

      <DashboardOperationalInsights displayStats={displayStats} />

      <SystemHealthWidget />

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <RevenueChartWidget chartData={chartData} />
        <RecentSalesWidget recentSales={recentSales} />
      </div>
    </div>
  );
}
