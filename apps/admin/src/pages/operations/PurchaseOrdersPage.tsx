import { useState } from 'react';
import { Card, Button, Input, Badge } from '@byteevolvr/ui';
import { Search, Plus, Filter, FileCheck, ArrowRight } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';

export function PurchaseOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const orders = [
    {
      id: 'PO-2023-104',
      vendor: 'TechSupplies Inc.',
      date: '2023-10-16',
      expectedDelivery: '2023-10-25',
      amount: 125000.0,
      status: 'issued',
    },
    {
      id: 'PO-2023-105',
      vendor: 'Office Rentals LLC',
      date: '2023-10-18',
      expectedDelivery: '2023-10-20',
      amount: 45000.0,
      status: 'received',
    },
    {
      id: 'PO-2023-106',
      vendor: 'Global Networks',
      date: '2023-10-21',
      expectedDelivery: '2023-11-05',
      amount: 350000.0,
      status: 'draft',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Purchase Orders</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage orders sent to vendors and suppliers
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create PO
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Search POs or vendors..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary hover:underline cursor-pointer">
                      {item.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{item.vendor}</TableCell>
                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-on-surface-variant">
                    <ArrowRight className="h-3 w-3" />
                    {new Date(item.expectedDelivery).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === 'ordered'
                        ? 'primary'
                        : item.status === 'received'
                          ? 'success'
                          : 'default'
                    }
                  >
                    {item.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                    View
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
