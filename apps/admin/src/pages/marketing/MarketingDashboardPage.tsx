import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import {
  Megaphone,
  Users,
  MousePointerClick,
  TrendingUp,
  Loader2,
  Plus,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';
import { AdminService } from '@byteevolvr/api-client';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function MarketingDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeCampaigns: 0,
    totalAudience: 0,
    avgClickRate: 0,
    generatedRevenue: 0,
    performanceChart: [] as any[],
    recentCampaigns: [] as any[],
    alerts: [] as any[],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getMarketingDashboardMetrics();
      if (res?.data) {
        setMetrics({
          activeCampaigns: res.data.active_campaigns || 0,
          totalAudience: res.data.total_audience || 0,
          avgClickRate: res.data.avg_click_rate || 0,
          generatedRevenue: res.data.generated_revenue || 0,
          performanceChart: res.data.performance_chart || [
            { name: 'Mon', clicks: 4000, opens: 6000 },
            { name: 'Tue', clicks: 3000, opens: 5000 },
            { name: 'Wed', clicks: 5000, opens: 8000 },
            { name: 'Thu', clicks: 2780, opens: 3908 },
            { name: 'Fri', clicks: 1890, opens: 4800 },
            { name: 'Sat', clicks: 2390, opens: 3800 },
            { name: 'Sun', clicks: 3490, opens: 4300 },
          ],
          recentCampaigns: res.data.recent_campaigns || [
            { id: 1, name: 'Summer Sale', status: 'Active', reach: '45K', clicks: '3.2K' },
            { id: 2, name: 'Welcome Series', status: 'Active', reach: '12K', clicks: '1.5K' },
          ],
          alerts: res.data.alerts || [
            { id: 1, message: 'Welcome Series open rate dropped by 5%', type: 'warning' },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to load marketing metrics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Marketing Overview</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Track campaign performance and audience engagement
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/marketing/segments">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" /> New Segment
            </Button>
          </Link>
          <Link to="/marketing/campaigns">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Campaign
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <Megaphone className="h-5 w-5" />
            <span className="font-medium">Active Campaigns</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">{metrics.activeCampaigns}</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <Users className="h-5 w-5" />
            <span className="font-medium">Total Audience</span>
          </div>
          <h3 className="text-2xl font-bold text-primary">
            {(metrics.totalAudience / 1000).toFixed(1)}K
          </h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-success">
            <MousePointerClick className="h-5 w-5" />
            <span className="font-medium">Avg. Click Rate</span>
          </div>
          <h3 className="text-2xl font-bold text-success">{metrics.avgClickRate}%</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">Generated Revenue</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">
            ₹{(metrics.generatedRevenue / 100000).toFixed(2)}L
          </h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-0 overflow-hidden lg:col-span-2 flex flex-col h-[350px]">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface flex justify-between items-center">
            <span>Engagement Trend (7 Days)</span>
            <BarChart3 className="h-4 w-4 text-on-surface-variant" />
          </div>
          <div className="p-6 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.performanceChart}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-outline-variant)"
                  opacity={0.3}
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="opens"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="var(--color-success)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden flex flex-col h-[350px]">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface">
            Alerts & Recommendations
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {metrics.alerts.length === 0 ? (
              <div className="text-center text-sm text-on-surface-variant mt-4">No alerts</div>
            ) : (
              metrics.alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className="p-3 bg-warning/10 border border-warning/20 text-warning-dark rounded-lg text-sm"
                >
                  {alert.message}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface flex justify-between items-center">
          <span>Active Campaigns</span>
          <Link
            to="/marketing/campaigns"
            className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
          >
            View All <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reach</TableHead>
              <TableHead>Clicks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.recentCampaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-on-surface-variant">
                  No active campaigns
                </TableCell>
              </TableRow>
            ) : (
              metrics.recentCampaigns.map((camp: any) => (
                <TableRow key={camp.id}>
                  <TableCell className="font-medium">{camp.name}</TableCell>
                  <TableCell>
                    <span className="bg-success/10 text-success text-xs font-bold px-2 py-1 rounded">
                      {camp.status}
                    </span>
                  </TableCell>
                  <TableCell>{camp.reach}</TableCell>
                  <TableCell className="text-primary font-medium">{camp.clicks}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
