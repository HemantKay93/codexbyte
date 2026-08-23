import { useState, useEffect } from 'react';
import { Card, Button } from '@byteevolvr/ui';
import {
  Loader2,
  Plus,
  AlertTriangle,
  ShieldCheck,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Activity,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { SLAService } from '@byteevolvr/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SLADashboardPage() {
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<any[]>([]);
  const [breaches, setBreaches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'policies' | 'breaches'>('breaches');

  const mockMetrics = {
    complianceRate: '98.5%',
    openBreaches: breaches.filter((b) => b.status === 'open').length || 2,
    avgResponseTime: '1h 15m',
    activePolicies: policies.length || 5,
    complianceTrend: [
      { day: 'Mon', compliance: 99 },
      { day: 'Tue', compliance: 98 },
      { day: 'Wed', compliance: 100 },
      { day: 'Thu', compliance: 97 },
      { day: 'Fri', compliance: 95 },
      { day: 'Sat', compliance: 100 },
      { day: 'Sun', compliance: 100 },
    ],
  };

  const fetchData = async () => {
    try {
      const [policiesRes, breachesRes] = await Promise.all([
        SLAService.getPolicies(),
        SLAService.getBreaches(),
      ]);
      setPolicies(policiesRes.data);
      setBreaches(breachesRes.data);
    } catch (error) {
      console.error('Failed to load SLA data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreatePolicy = async () => {
    try {
      await SLAService.createPolicy({
        name: 'Standard Support Response',
        description: 'First response time for standard tickets',
        module: 'support',
        entity_type: 'ticket',
        conditions: [],
        targets: [
          {
            metric: 'first_response_time',
            target_value_minutes: 240,
            warning_threshold_minutes: 180,
            business_hours_only: true,
          },
        ],
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create policy', error);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await SLAService.acknowledgeBreach(id);
      fetchData();
    } catch (error) {
      console.error('Failed to acknowledge breach', error);
    }
  };

  if (loading && policies.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">
            Service Level Agreements (SLA)
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage your service commitments and monitor compliance in real-time.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" /> Export Report
          </Button>
          <Button className="gap-2" onClick={handleCreatePolicy}>
            <Plus className="h-4 w-4" /> New Policy
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center gap-3 mb-2 text-success">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-medium">Compliance Rate</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">{mockMetrics.complianceRate}</h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-error">
          <div className="flex items-center gap-3 mb-2 text-error">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Open Breaches</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">{mockMetrics.openBreaches}</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Avg Response Time</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">{mockMetrics.avgResponseTime}</h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <Activity className="h-5 w-5" />
            <span className="font-medium">Active Policies</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">{mockMetrics.activePolicies}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-0 lg:col-span-2 overflow-hidden flex flex-col h-[350px]">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface">
            SLA Compliance Trend (Last 7 Days)
          </div>
          <div className="p-6 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockMetrics.complianceTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-outline-variant)"
                  opacity={0.3}
                />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  domain={[80, 100]}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar
                  dataKey="compliance"
                  fill="var(--color-success)"
                  radius={[4, 4, 0, 0]}
                  name="Compliance %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Alerts */}
        <Card className="p-0 overflow-hidden flex flex-col h-[350px]">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" /> At Risk & Warnings
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm font-semibold text-warning-dark">High Volume Alert</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Support tickets are 20% higher than normal. Response times may be impacted.
              </p>
            </div>
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm font-semibold text-error">VIP Customer Ticket</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Ticket #4092 from Enterprise Corp is 10 minutes from breaching SLA.
              </p>
            </div>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-semibold text-primary">System Update</p>
              <p className="text-xs text-on-surface-variant mt-1">
                SLA pauses will take effect during the scheduled maintenance window tonight.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant mt-8">
        <button
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'breaches' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => setActiveTab('breaches')}
        >
          Active Breaches
          {breaches.filter((b) => b.status === 'open').length > 0 && (
            <span className="ml-2 bg-error text-on-error text-xs rounded-full px-2 py-0.5">
              {breaches.filter((b) => b.status === 'open').length}
            </span>
          )}
        </button>
        <button
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'policies' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => setActiveTab('policies')}
        >
          Configured Policies
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'breaches' ? (
          <Card className="p-0 overflow-hidden border border-outline-variant">
            {breaches.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
                <ShieldCheck className="h-12 w-12 text-green-500 mb-4 opacity-50" />
                <p className="text-lg font-semibold">100% SLA Compliance</p>
                <p className="text-sm">There are no recorded SLA breaches.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {breaches.map((breach) => (
                  <div
                    key={breach.id}
                    className={`p-5 flex flex-col md:flex-row gap-4 items-start md:items-center ${breach.status === 'open' ? 'bg-error/5' : 'bg-surface'}`}
                  >
                    <div className="flex-shrink-0">
                      {breach.status === 'open' ? (
                        <ShieldAlert className="h-8 w-8 text-error" />
                      ) : (
                        <CheckCircle2 className="h-8 w-8 text-green-500 opacity-70" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-background">
                          {breach.sla_policies?.name}
                        </span>
                        <span className="text-xs uppercase tracking-wider bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded">
                          {breach.sla_policies?.module}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        Target missed:{' '}
                        <span className="font-medium text-on-surface">
                          {breach.sla_targets?.metric}
                        </span>
                        (Allowed {breach.sla_targets?.target_value_minutes}m)
                      </p>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Breached at:{' '}
                        {new Date(breach.breached_at).toLocaleString()}
                        <span className="mx-2">•</span>
                        Entity ID: {breach.entity_id.split('-')[0]}...
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {breach.status === 'open' ? (
                        <Button
                          variant="outline"
                          className="text-error border-error/30 hover:bg-error/10"
                          onClick={() => handleAcknowledge(breach.id)}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" /> Acknowledge
                        </Button>
                      ) : (
                        <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center h-64 text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl">
                <p className="text-lg font-semibold">No Policies Found</p>
                <p className="text-sm mb-4">You have not configured any SLA rules.</p>
                <Button onClick={handleCreatePolicy}>Create Default Policy</Button>
              </div>
            ) : (
              policies.map((policy) => (
                <Card key={policy.id} className="relative overflow-hidden group">
                  <div
                    className={`absolute top-0 left-0 w-1 h-full ${policy.is_active ? 'bg-green-500' : 'bg-surface-variant'}`}
                  />
                  <div className="pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-on-background line-clamp-1">{policy.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {policy.module}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant mb-4 line-clamp-2 min-h-[40px]">
                      {policy.description}
                    </p>

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                        Targets
                      </h4>
                      {policy.sla_targets?.map((target: any) => (
                        <div
                          key={target.id}
                          className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-on-surface">
                              {target.metric.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm font-bold text-on-background">
                              {target.target_value_minutes}m
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                            {target.warning_threshold_minutes && (
                              <span>Warn at: {target.warning_threshold_minutes}m</span>
                            )}
                            {target.business_hours_only && (
                              <span className="flex items-center gap-1 text-primary">
                                <Clock className="h-3 w-3" /> Biz Hours
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
