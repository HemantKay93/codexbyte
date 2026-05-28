import { Card, Button, Badge } from '@byteevolvr/ui';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../components/ui/Table';
import { Plus, Zap, Send, MousePointerClick, TrendingUp, MoreHorizontal } from 'lucide-react';

const workflows = [
  {
    id: '1',
    name: 'Abandoned Cart Recovery',
    trigger: 'Cart idle for 2 hours',
    active: true,
    sent: 1245,
    conversion: '12.4%',
  },
  {
    id: '2',
    name: 'Welcome Series - New Users',
    trigger: 'On Sign up',
    active: true,
    sent: 8430,
    conversion: '45.2%',
  },
  {
    id: '3',
    name: 'Post-Purchase Review Request',
    trigger: '7 days after delivery',
    active: true,
    sent: 3210,
    conversion: '8.1%',
  },
  {
    id: '4',
    name: 'Win-back Campaign (90 days)',
    trigger: 'No purchase for 90 days',
    active: false,
    sent: 540,
    conversion: '2.3%',
  },
];

export function MarketingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Marketing Automation</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Design and manage automated email & SMS workflows
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
              <Send className="h-5 w-5 text-primary" />
              <span className="font-medium">Total Sent</span>
            </div>
            <div className="text-3xl font-bold text-on-surface">145k</div>
            <div className="text-xs text-emerald-600 mt-2 font-medium">+12% this month</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
              <MousePointerClick className="h-5 w-5 text-primary" />
              <span className="font-medium">Avg. Open Rate</span>
            </div>
            <div className="text-3xl font-bold text-on-surface">34.2%</div>
            <div className="text-xs text-emerald-600 mt-2 font-medium">+2.1% this month</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium">Revenue Attributed</span>
            </div>
            <div className="text-3xl font-bold text-on-surface">$12,450</div>
            <div className="text-xs text-emerald-600 mt-2 font-medium">+8% this month</div>
          </div>
        </Card>
        <Card className="bg-primary-container border-primary-container text-on-primary-container">
          <div className="p-6 flex flex-col items-center justify-center text-center h-full">
            <Zap className="h-8 w-8 mb-2 opacity-80" />
            <h3 className="font-bold mb-1">Boost Sales</h3>
            <p className="text-xs opacity-90 mb-3">Create a flash sale campaign</p>
            <Button variant="secondary" size="sm" className="w-full">
              Quick Start
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="text-lg font-semibold text-on-surface">Active Workflows</h2>
          <Button variant="ghost" size="sm" className="gap-2 text-primary">
            View All
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow Name</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Sent</TableHead>
              <TableHead className="text-right">Conversion</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.map((wf) => (
              <TableRow key={wf.id}>
                <TableCell className="font-medium text-on-surface">{wf.name}</TableCell>
                <TableCell className="text-sm text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3" />
                    {wf.trigger}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={wf.active ? 'success' : 'secondary'}>
                    {wf.active ? 'Active' : 'Paused'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-on-surface-variant">
                  {wf.sent.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-medium text-emerald-600">
                  {wf.conversion}
                </TableCell>
                <TableCell>
                  <button className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Visual Workflow Builder Snippet */}
      <h2 className="text-lg font-semibold text-on-surface mt-8 mb-4">
        Recent Campaign (Visualizer)
      </h2>
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-8 flex flex-col items-center">
        <div className="bg-surface border border-outline border-l-4 border-l-primary p-4 rounded shadow-sm w-64 text-center">
          <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">
            Trigger
          </div>
          <div className="font-medium text-on-surface text-sm">Customer Joined Segment</div>
          <div className="text-xs text-on-surface-variant mt-1">Segment: "High Value"</div>
        </div>
        <div className="h-8 w-px bg-outline border-l border-dashed my-1"></div>
        <div className="bg-surface border border-outline border-l-4 border-l-info p-4 rounded shadow-sm w-64 text-center">
          <div className="text-xs font-bold text-info mb-1 uppercase tracking-wider">Action</div>
          <div className="font-medium text-on-surface text-sm">Send Email</div>
          <div className="text-xs text-on-surface-variant mt-1">Template: "VIP Welcome"</div>
        </div>
        <div className="h-8 w-px bg-outline border-l border-dashed my-1 relative">
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-surface border border-outline rounded-full px-2 py-0.5 text-[10px] font-medium text-on-surface-variant whitespace-nowrap">
            Wait 3 days
          </div>
        </div>
        <div className="bg-surface border border-outline border-l-4 border-l-warning p-4 rounded shadow-sm w-64 text-center">
          <div className="text-xs font-bold text-warning mb-1 uppercase tracking-wider">
            Condition
          </div>
          <div className="font-medium text-on-surface text-sm">Did open email?</div>
        </div>
      </div>
    </div>
  );
}
