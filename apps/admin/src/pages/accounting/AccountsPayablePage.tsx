import { useState } from 'react';
import { Card, Button, Input, Badge } from '@byteevolvr/ui';
import { Search, Filter, Download, ArrowDownRight, TrendingDown } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';

export function AccountsPayablePage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for AP
  const payables = [
    {
      id: 'BILL-001',
      vendor: 'TechSupplies Inc.',
      amount: 150000.0,
      dueDate: '2023-10-20',
      status: 'overdue',
      daysOverdue: 7,
    },
    {
      id: 'BILL-004',
      vendor: 'Office Rentals LLC',
      amount: 45000.0,
      dueDate: '2023-11-05',
      status: 'pending',
      daysOverdue: 0,
    },
    {
      id: 'BILL-007',
      vendor: 'Cloud Hosting Services',
      amount: 12500.0,
      dueDate: '2023-11-12',
      status: 'pending',
      daysOverdue: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Accounts Payable</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage vendor bills and outgoing payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Aging Report
          </Button>
          <Button className="gap-2">
            <ArrowDownRight className="h-4 w-4" />
            Make Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <p className="text-sm text-on-surface-variant mb-1">Total Payable</p>
          <h3 className="text-2xl font-bold text-on-surface">₹2,07,500.00</h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-error">
          <p className="text-sm text-on-surface-variant mb-1">Overdue (1-30 Days)</p>
          <h3 className="text-2xl font-bold text-error">₹1,50,000.00</h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-error">
          <p className="text-sm text-on-surface-variant mb-1">Overdue (31+ Days)</p>
          <h3 className="text-2xl font-bold text-error">₹0.00</h3>
        </Card>
        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-on-surface-variant mb-1">Upcoming (7 Days)</p>
            <h3 className="text-2xl font-bold text-on-surface">₹45,000.00</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <TrendingDown className="h-5 w-5" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Search bills or vendors..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter Status
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payables.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-primary hover:underline cursor-pointer">
                  {item.id}
                </TableCell>
                <TableCell>{item.vendor}</TableCell>
                <TableCell>
                  <span className={item.daysOverdue > 0 ? 'text-error font-medium' : ''}>
                    {new Date(item.dueDate).toLocaleDateString()}
                  </span>
                  {item.daysOverdue > 0 && (
                    <span className="text-xs text-error ml-2">({item.daysOverdue} days late)</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge variant={item.status === 'overdue' ? 'error' : 'default'}>
                    {item.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                    Pay Now
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
