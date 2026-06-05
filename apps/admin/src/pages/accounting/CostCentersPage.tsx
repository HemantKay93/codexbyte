import { useState } from 'react';
import { Card, Button, Input, Badge } from '@byteevolvr/ui';
import { Search, Plus, Filter, Network } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';

export function CostCentersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for Cost Centers
  const costCenters = [
    {
      id: 'CC-001',
      name: 'Head Office HQ',
      code: 'HQ-100',
      manager: 'John Doe',
      status: 'active',
      totalExpenses: 450000.0,
    },
    {
      id: 'CC-002',
      name: 'Marketing Dept',
      code: 'MKT-200',
      manager: 'Sarah Smith',
      status: 'active',
      totalExpenses: 125000.0,
    },
    {
      id: 'CC-003',
      name: 'R&D Center',
      code: 'RND-300',
      manager: 'Dr. Emily Chen',
      status: 'active',
      totalExpenses: 850000.0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Cost Centers</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Track expenses by organizational departments or projects
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Cost Center
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Search cost centers..."
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
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead className="text-right">Total Expenses (YTD)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costCenters.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-sm text-on-surface-variant">
                  {item.code}
                </TableCell>
                <TableCell className="font-medium text-on-surface">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-primary" />
                    {item.name}
                  </div>
                </TableCell>
                <TableCell>{item.manager}</TableCell>
                <TableCell className="text-right font-medium text-error">
                  ₹{item.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge variant={item.status === 'active' ? 'primary' : 'default'}>
                    {item.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                    View Ledger
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
