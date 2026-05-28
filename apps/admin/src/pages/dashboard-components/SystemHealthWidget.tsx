import { useEffect, useState } from 'react';
import { Card } from '@byteevolvr/ui';
import { Activity } from 'lucide-react';
import { AdminService } from '@byteevolvr/api-client';

export function SystemHealthWidget() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    AdminService.getIntegrationHealth()
      .then((res) => setHealth(res.data))
      .catch((err) => console.error('Failed to fetch system health:', err));
  }, []);

  if (!health) return null;

  const services = [
    { name: 'Database', data: health.database },
    { name: 'Redis Cache', data: health.redis },
    { name: 'Email API', data: health.email },
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
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
