import { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import { Search, MapPin } from 'lucide-react';

export function ShipmentTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const shipments = [
    {
      trackingNumber: '1Z999999999',
      orderId: 'ORD-2091',
      carrier: 'UPS',
      status: 'in-transit',
      location: 'Chicago, IL',
      lastUpdated: '2 hours ago',
    },
    {
      trackingNumber: '77123456789',
      orderId: 'ORD-2090',
      carrier: 'FedEx',
      status: 'delivered',
      location: 'New York, NY',
      lastUpdated: '1 day ago',
    },
    {
      trackingNumber: '94001000000',
      orderId: 'ORD-2089',
      carrier: 'USPS',
      status: 'exception',
      location: 'Denver, CO',
      lastUpdated: '5 hours ago',
    },
    {
      trackingNumber: '1Z888888888',
      orderId: 'ORD-2092',
      carrier: 'UPS',
      status: 'label-created',
      location: 'Warehouse A',
      lastUpdated: '10 mins ago',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-transit':
        return <Badge variant="primary">In Transit</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'exception':
        return <Badge variant="error">Exception</Badge>;
      case 'label-created':
        return <Badge variant="default">Label Created</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Shipment Tracking</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Monitor real-time status of all outbound shipments
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Track by tracking number or Order ID..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">Sync Statuses</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking #</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Location</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.map((item) => (
              <TableRow key={item.trackingNumber}>
                <TableCell className="font-mono text-sm text-primary hover:underline cursor-pointer">
                  {item.trackingNumber}
                </TableCell>
                <TableCell className="font-medium">{item.orderId}</TableCell>
                <TableCell>{item.carrier}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="text-sm">{item.location}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-on-surface-variant">
                  {item.lastUpdated}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
