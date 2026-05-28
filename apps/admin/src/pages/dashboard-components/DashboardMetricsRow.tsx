import { Card } from '@byteevolvr/ui';
import { ArrowUpRight, DollarSign, ShoppingBag, Users, Activity } from 'lucide-react';

interface DashboardMetricsRowProps {
  displayStats: {
    totalRevenue: number;
    revenueDelta: number;
    salesCount: number;
    salesDelta: number;
    customerCount: number;
    avgOrderValue: number;
  };
}

export function DashboardMetricsRow({ displayStats }: DashboardMetricsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-on-surface-variant">Total Revenue</p>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">₹{displayStats.totalRevenue.toLocaleString()}</div>
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
        </div>
      </Card>

      <Card>
        <div className="p-6">
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
        </div>
      </Card>

      <Card>
        <div className="p-6">
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
        </div>
      </Card>

      <Card>
        <div className="p-6">
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
        </div>
      </Card>
    </div>
  );
}
