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
import { Search, Filter, Receipt, Upload } from 'lucide-react';

export function VendorBillsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const bills = [
    {
      id: 'BILL-2023-089',
      vendor: 'TechSupplies Inc.',
      ref: 'INV-TS-992',
      date: '2023-10-22',
      dueDate: '2023-11-21',
      amount: 125000.0,
      status: 'unpaid',
    },
    {
      id: 'BILL-2023-090',
      vendor: 'Office Rentals LLC',
      ref: 'OCT-RENT',
      date: '2023-10-01',
      dueDate: '2023-10-15',
      amount: 45000.0,
      status: 'paid',
    },
    {
      id: 'BILL-2023-091',
      vendor: 'AWS Cloud Services',
      ref: 'AWS-44582',
      date: '2023-10-25',
      dueDate: '2023-10-30',
      amount: 12500.0,
      status: 'overdue',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Vendor Bills</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage incoming invoices and accounts payable
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Bill
          </Button>
          <Button className="gap-2">Record Bill</Button>
        </div>
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
            Filters
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill ID</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Vendor Ref</TableHead>
              <TableHead>Bill Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary hover:underline cursor-pointer">
                      {item.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{item.vendor}</TableCell>
                <TableCell className="text-sm text-on-surface-variant">{item.ref}</TableCell>
                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                <TableCell className={item.status === 'overdue' ? 'text-error font-medium' : ''}>
                  {new Date(item.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === 'paid'
                        ? 'success'
                        : item.status === 'overdue'
                          ? 'error'
                          : 'warning'
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
