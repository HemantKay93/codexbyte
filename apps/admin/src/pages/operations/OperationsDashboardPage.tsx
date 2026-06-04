import { useState, useEffect } from 'react';
import { Card, Button } from '@byteevolvr/ui';
import { Loader2, Activity, Database, Server, HardDrive, AlertCircle, Info, RefreshCw, CheckCircle2 } from 'lucide-react';
import { OperationsService } from '@byteevolvr/api-client';

export function OperationsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<any>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    fetchHealth();
    // In a real app, we'd poll this or use websockets
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await OperationsService.getSystemHealth();
      setHealthData(res.data);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Failed to load system health', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !healthData) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { services, queues, recent_events } = healthData;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background flex items-center gap-3">
            Operational Command Center
            <span className="flex items-center gap-2 text-xs bg-green-500/10 text-green-600 px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-wider font-bold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 flex items-center gap-2">
            Monitor real-time infrastructure, queue health, and system events.
            <span className="opacity-50 text-xs">|</span>
            <span className="text-xs">Last updated: {lastRefreshed.toLocaleTimeString()}</span>
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchHealth}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Services */}
        <Card className="col-span-1 border border-outline-variant p-0 overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-lowest font-semibold text-sm flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" /> Core Infrastructure
          </div>
          <div className="divide-y divide-outline-variant">
            <div className="p-4 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">PostgreSQL Cluster</p>
                  <p className="text-xs text-on-surface-variant">{services.database.latency_ms}ms latency</p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            
            <div className="p-4 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Redis In-Memory</p>
                  <p className="text-xs text-on-surface-variant">{services.redis.memory_usage_mb} MB used</p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <HardDrive className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Object Storage (S3)</p>
                  <p className="text-xs text-on-surface-variant">{services.storage.space_used_gb} GB used</p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </Card>

        {/* Queues */}
        <Card className="col-span-1 md:col-span-2 border border-outline-variant p-0 overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-lowest font-semibold text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> BullMQ Background Workers
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                  <th className="pb-3 font-semibold">Queue Name</th>
                  <th className="pb-3 font-semibold text-right">Active</th>
                  <th className="pb-3 font-semibold text-right">Waiting</th>
                  <th className="pb-3 font-semibold text-right">Failed</th>
                  <th className="pb-3 font-semibold text-right">Processed (1h)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {queues.map((q: any) => (
                  <tr key={q.name} className="hover:bg-surface-container-lowest">
                    <td className="py-3 font-medium text-sm">{q.name}</td>
                    <td className="py-3 text-right text-sm">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{q.active}</span>
                    </td>
                    <td className="py-3 text-right text-sm">
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">{q.waiting}</span>
                    </td>
                    <td className="py-3 text-right text-sm">
                      {q.failed > 0 ? (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{q.failed}</span>
                      ) : (
                        <span className="text-on-surface-variant font-medium">0</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-sm font-medium text-on-surface-variant">
                      {q.processed_1h.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Events Log */}
        <Card className="col-span-1 md:col-span-3 border border-outline-variant p-0 overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-lowest font-semibold text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" /> Global System Event Log
          </div>
          <div className="divide-y divide-outline-variant">
            {recent_events.map((event: any, idx: number) => (
              <div key={idx} className="p-4 flex gap-4 hover:bg-surface-container-lowest transition-colors items-start">
                <div className="mt-0.5">
                  {event.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                  {event.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                  {event.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-on-background">{event.message}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant font-mono">
                    <span>Source: {event.source}</span>
                    <span>•</span>
                    <span>{new Date(event.time).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
