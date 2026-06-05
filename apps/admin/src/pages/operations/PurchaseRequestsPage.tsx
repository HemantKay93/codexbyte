import { useState } from 'react';
import { Card, Button, Input, Badge } from '@byteevolvr/ui';
import { Search, Plus, Filter, FileText } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';

export function PurchaseRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const requests = [
    {
      id: 'PR-23-001',
      department: 'IT',
      requestor: 'Michael Scott',
      date: '2023-10-15',
      items: 3,
      estimatedValue: 4500.0,
      status: 'approved',
    },
    {
      id: 'PR-23-002',
      department: 'Marketing',
      requestor: 'Pam Beesly',
      date: '2023-10-18',
      items: 1,
      estimatedValue: 1200.0,
      status: 'pending',
    },
    {
      id: 'PR-23-003',
      department: 'Sales',
      requestor: 'Jim Halpert',
      date: '2023-10-20',
      items: 5,
      estimatedValue: 8500.0,
      status: 'rejected',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Purchase Requests</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Internal department requests for goods and services
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Search by ID or requestor..."
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
              <TableHead>PR Number</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Requestor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Est. Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-on-surface-variant" />
                    <span className="font-medium text-primary hover:underline cursor-pointer">
                      {item.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{item.department}</TableCell>
                <TableCell>{item.requestor}</TableCell>
                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right font-medium">
                  ₹{item.estimatedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === 'approved'
                        ? 'success'
                        : item.status === 'pending'
                          ? 'default'
                          : 'error'
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
