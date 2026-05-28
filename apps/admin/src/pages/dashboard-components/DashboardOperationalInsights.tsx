import { Card, Button } from '@byteevolvr/ui';
import { Activity, ShoppingBag } from 'lucide-react';

interface DashboardOperationalInsightsProps {
  displayStats: {
    pendingOrders: number;
    lowStockAlertsCount: number;
  };
}

export function DashboardOperationalInsights({ displayStats }: DashboardOperationalInsightsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Pending Actions Widget */}
      <Card className="border-l-4 border-l-warning bg-warning/5">
        <div className="pb-2">
          <div className="flex items-center justify-between">
            <div className="text-warning flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Pending Actions
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-on-surface">{displayStats.pendingOrders}</p>
              <p className="text-sm text-on-surface-variant">Orders awaiting fulfillment</p>
            </div>
            <Button
              onClick={() => (window.location.href = '/orders')}
              variant="outline"
              className="border-warning text-warning hover:bg-warning/10"
            >
              Review Orders
            </Button>
          </div>
        </div>
      </Card>

      {/* Low Stock Alerts Widget */}
      <Card className="border-l-4 border-l-error bg-error/5">
        <div className="pb-2">
          <div className="flex items-center justify-between">
            <div className="text-error flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Inventory Alerts
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-on-surface">
                {displayStats.lowStockAlertsCount}
              </p>
              <p className="text-sm text-on-surface-variant">SKUs critically low on stock</p>
            </div>
            <Button
              onClick={() => (window.location.href = '/inventory')}
              variant="outline"
              className="border-error text-error hover:bg-error/10"
            >
              Restock Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
