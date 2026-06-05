import { Card } from '@byteevolvr/ui';
import { Megaphone, Users, MousePointerClick, TrendingUp } from 'lucide-react';

export function MarketingDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Marketing Overview</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Track campaign performance and audience engagement
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <Megaphone className="h-5 w-5" />
            <span className="font-medium">Active Campaigns</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">12</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <Users className="h-5 w-5" />
            <span className="font-medium">Total Audience</span>
          </div>
          <h3 className="text-2xl font-bold text-primary">45.2K</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-success">
            <MousePointerClick className="h-5 w-5" />
            <span className="font-medium">Avg. Click Rate</span>
          </div>
          <h3 className="text-2xl font-bold text-success">4.8%</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">Generated Revenue</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">₹12.5L</h3>
        </Card>
      </div>

      <div className="text-center p-12 text-on-surface-variant border border-dashed border-outline-variant rounded-xl">
        Select a section from the sidebar to manage Campaigns or Segments.
      </div>
    </div>
  );
}
