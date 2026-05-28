import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Input } from '@byteevolvr/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/Table';
import { Search, Filter, Download, MoreHorizontal, Loader2 } from 'lucide-react';
import { useAdminStore } from '@byteevolvr/store';
import { AdminService } from '@byteevolvr/api-client';

export function OrderManagementPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { orders, setOrders, setError } = useAdminStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const data = await AdminService.getOrders();
      // Map user_profiles to user for backward compatibility
      const mappedData = data?.map((o: any) => ({
        ...o,
        user: o.user_profiles,
      }));
      setOrders(mappedData || []);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      setError(error.customMessage || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  const exportOrders = () => {
    const headers = ['Order #', 'Date', 'Customer', 'Status', 'Total'];
    const rows = orders.map((o) => [
      o.order_number,
      new Date(o.created_at).toLocaleDateString(),
      o.customer_name ||
        o.user?.full_name ||
        (o.order_number?.startsWith('POS') ? 'Walk-in Customer' : 'Guest Customer'),
      o.customer_email || o.user?.email || '',
      o.status,
      o.total_amount,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter((o) => {
    const customerName = o.customer_name || o.user?.full_name || '';
    const customerEmail = o.customer_email || o.user?.email || '';
    const q = searchTerm.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(q) ||
      customerName.toLowerCase().includes(q) ||
      customerEmail.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Orders</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage and track customer orders
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportOrders}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
              <Input
                placeholder="Search orders by ID or customer..."
                className="pl-9"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
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
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <span className="text-sm text-on-surface-variant mt-2 block">
                      Loading orders...
                    </span>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-on-surface-variant">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const dateObj = new Date(order.created_at);
                  const dateStr = dateObj.toLocaleDateString();
                  return (
                    <TableRow key={order.id}>
                      <TableCell
                        className="font-medium text-primary hover:underline cursor-pointer"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        {order.order_number}
                      </TableCell>
                      <TableCell className="text-on-surface-variant">{dateStr}</TableCell>
                      <TableCell className="text-on-surface">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {order.customer_name ||
                              order.user?.full_name ||
                              (order.order_number.startsWith('POS')
                                ? 'Walk-in Customer'
                                : 'Guest Customer')}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            {order.customer_email || order.user?.email || ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === 'delivered' || order.status === 'refunded'
                              ? 'success'
                              : order.status === 'shipped' ||
                                  order.status === 'packed' ||
                                  order.status === 'confirmed'
                                ? 'primary'
                                : order.status === 'cancelled'
                                  ? 'error'
                                  : 'warning'
                          }
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-on-surface">
                        ₹{Number(order.total_amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <button className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container transition-colors">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t border-outline-variant flex items-center justify-between text-sm text-on-surface-variant">
          <div>Showing {filteredOrders.length} orders</div>
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
