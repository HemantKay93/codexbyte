import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Input } from '../components/ui';
import { ArrowLeft, Edit, Mail, MapPin, ShoppingBag, CreditCard, Star, Loader2, Phone, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [address, setAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    orderCount: 0,
    avgOrderValue: 0,
    reviewsCount: 0
  });

  useEffect(() => {
    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  async function fetchCustomerData() {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      setCustomer(profile);

      // 2. Fetch Orders
      const { data: customerOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(customerOrders || []);

      // 3. Fetch Primary Address
      const { data: addresses, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', id)
        .eq('is_default', true)
        .limit(1);

      if (!addressError && addresses && addresses.length > 0) {
        setAddress(addresses[0]);
      } else if (!addressError) {
        // Try getting any address if no default
        const { data: anyAddress } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', id)
          .limit(1);
        if (anyAddress && anyAddress.length > 0) setAddress(anyAddress[0]);
      }

      // 4. Calculate Stats
      const totalSpent = (customerOrders || []).reduce((acc, o) => acc + Number(o.total_amount), 0);
      const orderCount = (customerOrders || []).length;
      
      // Fetch reviews count
      const { count: reviewsCount } = await supabase
        .from('product_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id);

      setStats({
        totalSpent,
        orderCount,
        avgOrderValue: orderCount > 0 ? totalSpent / orderCount : 0,
        reviewsCount: reviewsCount || 0
      });

    } catch (err) {
      console.error('Error fetching customer detail:', err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "info" | "warning" | "error" | "default"> = {
      delivered: 'success',
      shipped: 'info',
      processing: 'info',
      pending: 'warning',
      cancelled: 'error',
      refunded: 'error',
      paid: 'success',
      confirmed: 'info'
    };
    return <Badge variant={variants[status.toLowerCase()] || 'default'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-on-surface">Customer not found</h2>
        <Button variant="ghost" className="mt-4" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="px-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-display-sm font-semibold text-on-background">{customer.full_name}</h1>
          {stats.totalSpent > 50000 && <Badge variant="success">VIP Customer</Badge>}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            Contact
          </Button>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-on-surface-variant font-medium text-sm mb-1">Total Spent</div>
            <div className="text-3xl font-bold text-on-surface">₹{stats.totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-on-surface-variant font-medium text-sm mb-1">Total Orders</div>
            <div className="text-3xl font-bold text-on-surface">{stats.orderCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-on-surface-variant font-medium text-sm mb-1">Avg Order Value</div>
            <div className="text-3xl font-bold text-on-surface">₹{Math.round(stats.avgOrderValue).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-on-surface-variant font-medium text-sm mb-1">Reviews Left</div>
            <div className="text-3xl font-bold text-on-surface flex items-center gap-2">
              {stats.reviewsCount} <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <div className="p-4 border-b border-outline-variant">
              <h2 className="text-lg font-semibold text-on-surface">Customer Info</h2>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-on-surface">Email Address</div>
                  <div className="text-sm text-primary hover:underline cursor-pointer">{customer.email}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-on-surface">Primary Address</div>
                  {address ? (
                    <div className="text-sm text-on-surface-variant mt-1">
                      {address.full_name}<br/>
                      {address.line_1}{address.line_2 ? `, ${address.line_2}` : ''}<br/>
                      {address.city}, {address.state} {address.postal_code}<br/>
                      {address.country}
                    </div>
                  ) : (
                    <div className="text-sm text-on-surface-variant mt-1 italic">No address saved</div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-on-surface">Joined On</div>
                  <div className="text-sm text-on-surface-variant mt-1">{new Date(customer.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <div className="p-4 border-b border-outline-variant">
              <h2 className="text-lg font-semibold text-on-surface">Internal Notes</h2>
            </div>
            <CardContent className="p-4">
              <textarea 
                className="w-full bg-surface-container-lowest border border-outline rounded p-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none" 
                rows={4}
                placeholder="Add private notes about this customer..."
              />
              <Button size="sm" className="mt-3 w-full">Save Note</Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" /> Recent Orders
              </h2>
              <Link to="/orders">
                <Button variant="ghost" size="sm" className="text-primary">View All</Button>
              </Link>
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-on-surface-variant">
                        No orders found for this customer.
                      </TableCell>
                    </TableRow>
                  ) : orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-primary hover:underline cursor-pointer">
                        <Link to={`/orders/${order.id}`}>#{order.order_number}</Link>
                      </TableCell>
                      <TableCell className="text-on-surface-variant">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right font-medium">₹{Number(order.total_amount).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
