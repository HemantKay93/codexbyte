import { Card, Button, Badge } from '@byteevolvr/ui';
import { ArrowRight, Plus, CheckCircle2, XCircle } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';

export function StockTransfersPage() {
  const transfers = [
    {
      id: 'TRF-001',
      from: 'Main Warehouse (NY)',
      to: 'Retail Store (BOS)',
      items: 4,
      status: 'in-transit',
      date: '2023-10-24',
    },
    {
      id: 'TRF-002',
      from: 'Supplier Depot',
      to: 'Main Warehouse (NY)',
      items: 12,
      status: 'completed',
      date: '2023-10-20',
    },
    {
      id: 'TRF-003',
      from: 'Retail Store (BOS)',
      to: 'Returns Center',
      items: 1,
      status: 'pending',
      date: '2023-10-25',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Stock Transfers</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage inventory moving between warehouses and locations
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Transfer
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transfer Ref</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Total Items</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((trf) => (
              <TableRow key={trf.id}>
                <TableCell className="font-mono text-sm text-primary hover:underline cursor-pointer">
                  {trf.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-on-surface">{trf.from}</span>
                    <ArrowRight className="h-4 w-4 text-on-surface-variant" />
                    <span className="font-medium text-on-surface">{trf.to}</span>
                  </div>
                </TableCell>
                <TableCell>{trf.items}</TableCell>
                <TableCell>{new Date(trf.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      trf.status === 'completed'
                        ? 'success'
                        : trf.status === 'in-transit'
                          ? 'primary'
                          : 'default'
                    }
                  >
                    {trf.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {trf.status === 'pending' || trf.status === 'in-transit' ? (
                      <>
                        <button
                          title="Receive"
                          className="p-1.5 text-success hover:bg-success/10 rounded-md transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button
                          title="Cancel"
                          className="p-1.5 text-error hover:bg-error/10 rounded-md transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
