import React, { useState } from 'react';
import { Card, CardContent, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Input } from '../components/ui';
import { Search, Filter, ShieldAlert, Key, UserPlus, Settings, Package, ShoppingCart } from 'lucide-react';

const mockLogs = [
  { id: '1', user: 'Admin User', action: 'Settings Updated', details: 'Changed default currency to USD', time: '10 mins ago', type: 'system', icon: Settings },
  { id: '2', user: 'System', action: 'Security Alert', details: 'Failed login attempt from IP 192.168.1.42', time: '1 hour ago', type: 'security', icon: ShieldAlert },
  { id: '3', user: 'Jane Smith', action: 'Order Refunded', details: 'Refunded $356.39 for Order #ORD-7392', time: '2 hours ago', type: 'order', icon: ShoppingCart },
  { id: '4', user: 'Admin User', action: 'API Key Generated', details: 'Created new production API key for Stripe', time: '3 hours ago', type: 'system', icon: Key },
  { id: '5', user: 'John Doe', action: 'Product Updated', details: 'Updated stock for Premium Wireless Headphones', time: 'Yesterday', type: 'product', icon: Package },
  { id: '6', user: 'Admin User', action: 'User Invited', details: 'Invited mike@byteevolvr.com as Support Agent', time: 'Yesterday', type: 'user', icon: UserPlus },
];

export function ActivityLogPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">System Activity Log</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Audit trail of all administrative actions and security events</p>
        </div>
        <Button variant="outline">Export CSV</Button>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
              <Input
                placeholder="Search events, users, or IP addresses..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select className="h-10 px-3 rounded-md border border-outline bg-surface text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none">
              <option>All Events</option>
              <option>Security Only</option>
              <option>User Actions</option>
            </select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>User / Source</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLogs.map((log) => {
                const Icon = log.icon;
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${
                          log.type === 'security' ? 'bg-error/10 text-error' :
                          log.type === 'system' ? 'bg-primary/10 text-primary' :
                          'bg-surface-container text-on-surface-variant'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-on-surface">{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-on-surface-variant">{log.user}</TableCell>
                    <TableCell className="text-sm text-on-surface-variant max-w-md truncate">{log.details}</TableCell>
                    <TableCell className="text-right text-sm text-on-surface-variant">{log.time}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
