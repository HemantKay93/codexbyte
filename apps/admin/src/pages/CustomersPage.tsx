import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input, Badge } from '@byteevolvr/ui';
import { Search, Download, Filter, MoreHorizontal, Mail, Loader2, User } from 'lucide-react';
import { useAdminStore } from '@byteevolvr/store';
import { AdminService } from '@byteevolvr/api-client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/Table';

export function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { customers, setCustomers, setError } = useAdminStore();

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-line react-hooks/immutability // eslint-disable-line @typescript-eslint/no-floating-promises
  }, []);
  // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchCustomers() {
    setLoading(true);
    try {
      const data = await AdminService.getCustomers();
      setCustomers(data || []);
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Error fetching customers:', err);
      setError(err.customMessage || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCustomers = () => {
    const headers = ['Name', 'Email', 'Role', 'Orders', 'Total Spent', 'Joined'];
    const rows = filteredCustomers.map((c) => [
      c.full_name,
      c.email,
      c.role,
      c.orderCount,
      c.totalSpent,
      new Date(c.created_at).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Customers</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage customer profiles and history
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportCustomers}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">Add Customer</Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
              <Input
                placeholder="Search customers by name or email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-outline text-primary focus:ring-primary"
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <span className="text-sm text-on-surface-variant mt-2 block">
                      Loading customers...
                    </span>
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-on-surface-variant">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        className="rounded border-outline text-primary focus:ring-primary"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-sm">
                          {customer.full_name?.charAt(0) || <User className="h-4 w-4" />}
                        </div>
                        <div>
                          <Link
                            to={`/customers/${customer.id}`}
                            className="font-medium text-on-surface hover:text-primary hover:underline transition-colors"
                          >
                            {customer.full_name}
                          </Link>
                          <div className="text-[10px] text-on-surface-variant font-mono">
                            {customer.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                          <Mail className="h-3.5 w-3.5" />
                          {customer.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-on-surface">
                      {customer.orderCount || 0}
                    </TableCell>
                    <TableCell className="text-right font-medium text-on-surface">
                      ₹{(customer.totalSpent || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.role === 'admin' ? 'primary' : 'secondary'}>
                        {(customer.role || 'user').charAt(0).toUpperCase() +
                          (customer.role || 'user').slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container transition-colors">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t border-outline-variant flex items-center justify-between text-sm text-on-surface-variant">
          <div>Showing {filteredCustomers.length} customers</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
