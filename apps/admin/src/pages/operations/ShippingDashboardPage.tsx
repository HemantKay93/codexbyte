import { Card, Button } from '@byteevolvr/ui';
import { Truck, MapPin, PackageCheck, AlertCircle } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';

export function ShippingDashboardPage() {
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <PackageCheck className="h-5 w-5" />
            <span className="font-medium">Ready to Ship</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">45</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <Truck className="h-5 w-5" />
            <span className="font-medium">In Transit</span>
          </div>
          <h3 className="text-2xl font-bold text-primary">128</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-success">
            <MapPin className="h-5 w-5" />
            <span className="font-medium">Delivered (Today)</span>
          </div>
          <h3 className="text-2xl font-bold text-success">32</h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-error">
          <div className="flex items-center gap-3 mb-2 text-error">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Exceptions / Delays</span>
          </div>
          <h3 className="text-2xl font-bold text-error">4</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-0 lg:col-span-2 overflow-hidden">
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
              <TableRow>
                <TableCell className="font-mono text-sm text-primary hover:underline cursor-pointer">
                  1Z999999999
                </TableCell>
                <TableCell>#ORD-2091</TableCell>
                <TableCell>UPS Ground</TableCell>
                <TableCell>
                  <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded">
                    IN TRANSIT
                  </span>
                </TableCell>
                <TableCell>Oct 26, 2023</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm text-primary hover:underline cursor-pointer">
                  77123456789
                </TableCell>
                <TableCell>#ORD-2090</TableCell>
                <TableCell>FedEx Express</TableCell>
                <TableCell>
                  <span className="text-success text-xs font-bold bg-success/10 px-2 py-1 rounded">
                    DELIVERED
                  </span>
                </TableCell>
                <TableCell>Oct 24, 2023</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm text-primary hover:underline cursor-pointer">
                  94001000000
                </TableCell>
                <TableCell>#ORD-2089</TableCell>
                <TableCell>USPS Priority</TableCell>
                <TableCell>
                  <span className="text-error text-xs font-bold bg-error/10 px-2 py-1 rounded">
                    DELAYED
                  </span>
                </TableCell>
                <TableCell className="text-error">Oct 25, 2023</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface">
            Carrier Performance (7 Days)
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-on-surface">FedEx</span>
                <span className="text-on-surface-variant">98% On-Time</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-success w-[98%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-on-surface">UPS</span>
                <span className="text-on-surface-variant">95% On-Time</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-success w-[95%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-on-surface">USPS</span>
                <span className="text-on-surface-variant">82% On-Time</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-warning w-[82%]"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
