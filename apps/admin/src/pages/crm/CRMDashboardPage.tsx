import { useState, useEffect } from 'react';
import { Card, Button } from '@byteevolvr/ui';
import { Loader2, Plus, Users, Target, IndianRupee, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CRMService } from '@byteevolvr/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function CRMDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeDeals: 0,
    pipelineValue: 0,
    winRate: 0,
    newLeads: 0,
    neglectedDeals: [] as any[],
    pipelineChart: [] as any[],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await CRMService.getDashboardMetrics();
      if (res?.data) {
        setMetrics({
          activeDeals: res.data.active_deals || 0,
          pipelineValue: res.data.pipeline_value || 0,
          winRate: res.data.win_rate || 0,
          newLeads: res.data.new_leads || 0,
          neglectedDeals: res.data.neglected_deals || [],
          pipelineChart: res.data.pipeline_chart || [],
        });
      }
    } catch (error) {
      console.error('Failed to load CRM dashboard metrics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">CRM Dashboard</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Overview of your sales pipeline, deals, and opportunities
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/crm/leads">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Add Lead
            </Button>
          </Link>
          <Link to="/crm/pipeline">
            <Button className="gap-2">Go to Pipeline</Button>
          </Link>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <Target className="h-5 w-5" />
            <span className="font-medium text-sm uppercase tracking-wider">Active Deals</span>
          </div>
          <h3 className="text-3xl font-bold text-on-surface">{metrics.activeDeals}</h3>
        </Card>

        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <IndianRupee className="h-5 w-5" />
            <span className="font-medium text-sm uppercase tracking-wider">Pipeline Value</span>
          </div>
          <h3 className="text-3xl font-bold text-primary">
            ₹{metrics.pipelineValue.toLocaleString()}
          </h3>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-success">
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium text-sm uppercase tracking-wider">Win Rate</span>
          </div>
          <h3 className="text-3xl font-bold text-success">{metrics.winRate}%</h3>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-info">
            <Users className="h-5 w-5" />
            <span className="font-medium text-sm uppercase tracking-wider">
              New Leads (This Week)
            </span>
          </div>
          <h3 className="text-3xl font-bold text-info">{metrics.newLeads}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <Card className="p-0 overflow-hidden lg:col-span-2 flex flex-col">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h3 className="font-semibold text-on-surface">Pipeline Funnel</h3>
            <Link to="/crm/pipeline" className="text-sm font-medium text-primary hover:underline">
              View Pipeline
            </Link>
          </div>
          <div className="p-6 h-[300px] flex-1">
            {metrics.pipelineChart.length === 0 ? (
              <div className="flex justify-center items-center h-full text-on-surface-variant">
                No pipeline data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.pipelineChart}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="var(--color-outline-variant)"
                    opacity={0.3}
                  />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="stage"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--color-surface-container)' }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--color-primary)"
                    radius={[0, 4, 4, 0]}
                    name="Value (₹)"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Alerts Section */}
        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-on-surface">Neglected Deals</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {metrics.neglectedDeals.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-sm">
                No neglected deals. Great job!
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {metrics.neglectedDeals.map((deal, idx) => (
                  <div
                    key={idx}
                    className="p-4 hover:bg-surface-container-lowest transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm text-on-surface">{deal.title}</h4>
                      <span className="text-xs font-bold text-warning">
                        {deal.days_stalled} days
                      </span>
                    </div>
                    <div className="text-xs text-on-surface-variant flex justify-between">
                      <span>{deal.customer_name || 'No Customer'}</span>
                      <span className="font-semibold">₹{deal.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
