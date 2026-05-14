import { useEffect, useState } from 'react';
import { AdminService } from '@byteevolvr/api-client';
import { Loader2, Clock, MessageSquare } from 'lucide-react';
import { Badge } from './ui';

interface ActivityLog {
  id: string;
  status: string;
  notes: string;
  created_at: string;
  user_profiles?: {
    full_name: string;
  };
}

export function OrderActivityLogs({ orderId }: { orderId: string }) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const data = await AdminService.getOrderActivity(orderId);
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [orderId]);

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      {logs.length === 0 ? (
        <p className="text-center text-on-surface-variant italic py-4">
          No activity logs found for this order.
        </p>
      ) : (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-outline-variant">
          {logs.map((log) => (
            <div key={log.id} className="relative flex items-start gap-6">
              <div className="absolute left-0 h-10 w-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center z-10">
                <Clock className="h-4 w-4 text-on-surface-variant" />
              </div>
              <div className="ml-10 flex-1 pt-0.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="capitalize">
                      {log.status}
                    </Badge>
                    <span className="text-sm font-bold text-on-surface">
                      {log.user_profiles?.full_name || 'System'}
                    </span>
                  </div>
                  <time className="text-[10px] font-medium text-on-surface-variant uppercase">
                    {new Date(log.created_at).toLocaleString()}
                  </time>
                </div>
                {log.notes && (
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant flex gap-3 items-start">
                    <MessageSquare className="h-3 w-3 mt-1 text-on-surface-variant opacity-50" />
                    <p className="text-sm text-on-surface-variant leading-relaxed">{log.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
