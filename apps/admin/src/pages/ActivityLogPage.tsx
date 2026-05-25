import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@byteevolvr/ui';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';;
import {
  Search,
  Filter,
  ShieldAlert,
  UserPlus,
  Settings,
  Package,
  ShoppingCart,
} from 'lucide-react';
import { AdminService } from '@byteevolvr/api-client';
import { formatDistanceToNow } from 'date-fns';

export function ActivityLogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setError(null);
        const data = await AdminService.getAuditLogs();
        setLogs(data || []);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
        setError('Failed to load system activity logs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getLogIcon = (module: string) => {
    switch (module) {
      case 'auth':
        return ShieldAlert;
      case 'users':
        return UserPlus;
      case 'products':
        return Package;
      case 'orders':
        return ShoppingCart;
      default:
        return Settings;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">System Activity Log</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Audit trail of all administrative actions and security events
          </p>
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
        <div className="p-0">
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-on-surface-variant">
                    Loading audit logs...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-error">
                    {error}
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-on-surface-variant">
                    No activity logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const Icon = getLogIcon(log.module);
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${
                              log.module === 'auth'
                                ? 'bg-error/10 text-error'
                                : log.module === 'system'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-on-surface">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-on-surface-variant">
                        {log.user_profiles?.full_name || 'System'}
                      </TableCell>
                      <TableCell className="text-sm text-on-surface-variant max-w-md truncate">
                        {log.notes ||
                          (log.new_data ? JSON.stringify(log.new_data) : 'No details available')}
                      </TableCell>
                      <TableCell className="text-right text-sm text-on-surface-variant">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
