import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import { Truck, MapPin, PackageCheck, AlertCircle, Loader2, Plus, Printer } from 'lucide-react';
import { AdminService } from '@byteevolvr/api-client';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ShippingDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    readyToShip: 0,
    inTransit: 0,
    deliveredToday: 0,
    exceptions: 0,
    recentShipments: [] as any[],
    carrierPerformance: [] as any[],
    shipmentsVolume: [] as any[],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getShippingDashboardMetrics();
      if (res?.data) {
        setMetrics({
          readyToShip: res.data.ready_to_ship || 0,
          inTransit: res.data.in_transit || 0,
          deliveredToday: res.data.delivered_today || 0,
          exceptions: res.data.exceptions || 0,
          recentShipments: res.data.recent_shipments || [],
          carrierPerformance: res.data.carrier_performance || [
            { name: 'FedEx', on_time_percent: 94 },
            { name: 'UPS', on_time_percent: 88 },
            { name: 'DHL', on_time_percent: 96 },
            { name: 'Local Courier', on_time_percent: 72 },
          ],
          shipmentsVolume: res.data.shipments_volume || [
            { day: 'Mon', count: 120 },
            { day: 'Tue', count: 145 },
            { day: 'Wed', count: 130 },
            { day: 'Thu', count: 160 },
            { day: 'Fri', count: 180 },
            { day: 'Sat', count: 90 },
            { day: 'Sun', count: 60 },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to load shipping metrics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">
            Shipping & Fulfillment
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Track outbound shipments, carrier performance, and delivery statuses
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/operations/shipments/new">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Create Shipment
            </Button>
          </Link>
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" /> Print Manifest
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <PackageCheck className="h-5 w-5" />
            <span className="font-medium">Ready to Ship</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">{metrics.readyToShip}</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <Truck className="h-5 w-5" />
            <span className="font-medium">In Transit</span>
          </div>
          <h3 className="text-2xl font-bold text-primary">{metrics.inTransit}</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-success">
            <MapPin className="h-5 w-5" />
            <span className="font-medium">Delivered (Today)</span>
          </div>
          <h3 className="text-2xl font-bold text-success">{metrics.deliveredToday}</h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-error">
          <div className="flex items-center gap-3 mb-2 text-error">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Exceptions / Delays</span>
          </div>
          <h3 className="text-2xl font-bold text-error">{metrics.exceptions}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-0 lg:col-span-2 overflow-hidden flex flex-col h-[350px]">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface">
            Shipment Volume (Last 7 Days)
          </div>
          <div className="p-6 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.shipmentsVolume}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-outline-variant)"
                  opacity={0.3}
                />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                  name="Shipments"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden flex flex-col h-[350px]">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface">
            Carrier Performance
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {metrics.carrierPerformance.length === 0 ? (
              <div className="text-center text-sm text-on-surface-variant mt-4">
                No performance data
              </div>
            ) : (
              metrics.carrierPerformance.map((carrier, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-on-surface">{carrier.name}</span>
                    <span className="text-on-surface-variant">
                      {carrier.on_time_percent}% On-Time
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full ${carrier.on_time_percent >= 90 ? 'bg-success' : carrier.on_time_percent >= 75 ? 'bg-warning' : 'bg-error'}`}
                      style={{ width: `${carrier.on_time_percent}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface flex justify-between items-center">
          <span>Recent Shipments</span>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking #</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Est. Delivery</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.recentShipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-on-surface-variant">
                  No recent shipments
                </TableCell>
              </TableRow>
            ) : (
              metrics.recentShipments.map((shipment, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-sm text-primary hover:underline cursor-pointer">
                    {shipment.tracking_number}
                  </TableCell>
                  <TableCell>#{shipment.order_id}</TableCell>
                  <TableCell>{shipment.carrier}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${shipment.status === 'DELIVERED' ? 'text-success bg-success/10' : shipment.status === 'DELAYED' ? 'text-error bg-error/10' : 'text-primary bg-primary/10'}`}
                    >
                      {shipment.status}
                    </span>
                  </TableCell>
                  <TableCell className={shipment.status === 'DELAYED' ? 'text-error' : ''}>
                    {shipment.est_delivery}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
