import { useEffect, useState } from 'react';
import { Card } from '@byteevolvr/ui';
import { Activity } from 'lucide-react';
import { AdminService } from '@byteevolvr/api-client';

export function SystemHealthWidget() {
  const [health, setHealth] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    AdminService.getIntegrationHealth()
      .then((res) => {
        if (mounted) {
          setHealth(res?.data || res);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('Failed to fetch system health:', err);
          setError(err.customMessage || err.message || 'Failed to load system health');
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <Card className="col-span-1 md:col-span-2 mt-6 border-l-4 border-l-error bg-error/5">
        <div className="pb-2">
          <div className="flex items-center justify-between">
            <div className="text-error flex items-center gap-2 font-medium">
              <Activity className="h-5 w-5" />
              System & Integration Health
            </div>
          </div>
        </div>
        <div className="mt-2 text-sm text-error">
          Failed to load health status: {error}. Please ensure you are logged in as an admin.
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="col-span-1 md:col-span-2 mt-6 border-l-4 border-l-outline bg-surface-container-low animate-pulse">
        <div className="pb-2">
          <div className="flex items-center gap-2 font-medium text-on-surface-variant">
            <Activity className="h-5 w-5 opacity-50" />
            Checking System & Integration Health...
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col space-y-2">
              <div className="h-3 w-20 bg-outline-variant/30 rounded" />
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-outline-variant/50" />
                <div className="h-4 w-16 bg-outline-variant/30 rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!health) return null;

  const services = [
    { name: 'Database', data: health.database },
    { name: 'Redis Cache', data: health.redis },
    {
      name: health.email?.details?.includes('Provider:')
        ? health.email.details.split('Provider: ')[1].toUpperCase()
        : 'Email API',
      data: health.email,
    },
    { name: 'WhatsApp API', data: health.whatsapp },
  ];

  return (
    <Card className="col-span-1 md:col-span-2 mt-6 border-l-4 border-l-primary bg-primary/5">
      <div className="pb-2">
        <div className="flex items-center justify-between">
          <div className="text-primary flex items-center gap-2 font-medium">
            <Activity className="h-5 w-5" />
            System & Integration Health
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
        {services.map((svc) => (
          <div key={svc.name} className="flex flex-col">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              {svc.name}
            </span>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${svc.data?.status === 'connected' ? 'bg-emerald-500' : 'bg-error'}`}
              />
              <span className="text-sm font-medium text-on-surface capitalize">
                {svc.data?.status}
              </span>
            </div>
            {svc.data?.details && (
              <span
                className="text-[10px] text-on-surface-variant mt-1 truncate"
                title={svc.data?.details}
              >
                {svc.data?.details}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
