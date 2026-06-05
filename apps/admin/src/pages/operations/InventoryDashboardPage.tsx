import { Card, Button } from '@byteevolvr/ui';
import { Package, TrendingDown, AlertTriangle, ArrowRightLeft } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';

export function InventoryDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Inventory Dashboard</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Overview of stock levels, movements, and alerts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <Package className="h-5 w-5" />
            <span className="font-medium">Total Items in Stock</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">12,450</h3>
          <p className="text-xs text-success mt-2">+5.2% from last month</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <TrendingDown className="h-5 w-5" />
            <span className="font-medium">Total Value (Cost)</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">₹45,20,000</h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-warning">
          <div className="flex items-center gap-3 mb-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Low Stock Alerts</span>
          </div>
          <h3 className="text-2xl font-bold text-warning">24 Items</h3>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-warning hover:bg-warning/10 p-0 h-auto"
          >
            View details →
          </Button>
        </Card>
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <ArrowRightLeft className="h-5 w-5" />
            <span className="font-medium">Pending Transfers</span>
          </div>
          <h3 className="text-2xl font-bold text-primary">5</h3>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-primary hover:bg-primary/10 p-0 h-auto"
          >
            View transfers →
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-on-surface">
            Recent Stock Movements
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Wireless Earbuds</TableCell>
                <TableCell>
                  <span className="text-success text-xs font-bold bg-success/10 px-2 py-1 rounded">
                    IN
                  </span>
                </TableCell>
                <TableCell className="text-right">+500</TableCell>
                <TableCell className="text-on-surface-variant text-sm">Today, 10:45 AM</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">MacBook Pro 16"</TableCell>
                <TableCell>
                  <span className="text-error text-xs font-bold bg-error/10 px-2 py-1 rounded">
                    OUT
                  </span>
                </TableCell>
                <TableCell className="text-right">-12</TableCell>
                <TableCell className="text-on-surface-variant text-sm">
                  Yesterday, 4:20 PM
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">USB-C Hub</TableCell>
                <TableCell>
                  <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded">
                    TRF
                  </span>
                </TableCell>
                <TableCell className="text-right">50</TableCell>
                <TableCell className="text-on-surface-variant text-sm">
                  Yesterday, 2:15 PM
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low font-semibold text-error">
            Critical Low Stock
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Min Level</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Office Chair (Ergo)</TableCell>
                <TableCell className="text-right text-error font-bold">2</TableCell>
                <TableCell className="text-right text-on-surface-variant">15</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    Reorder
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Mechanical Keyboard</TableCell>
                <TableCell className="text-right text-error font-bold">5</TableCell>
                <TableCell className="text-right text-on-surface-variant">20</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    Reorder
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Webcam 1080p</TableCell>
                <TableCell className="text-right text-warning font-bold">12</TableCell>
                <TableCell className="text-right text-on-surface-variant">15</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    Reorder
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
