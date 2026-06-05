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
import { Search, Plus, Filter, TrendingUp } from 'lucide-react';

export function ProfitCentersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for Profit Centers
  const profitCenters = [
    {
      id: 'PC-001',
      name: 'Retail Stores',
      code: 'RET-100',
      manager: 'Michael Scott',
      status: 'active',
      revenue: 2500000.0,
      profit: 850000.0,
    },
    {
      id: 'PC-002',
      name: 'E-commerce',
      code: 'ECO-200',
      manager: 'Jim Halpert',
      status: 'active',
      revenue: 4200000.0,
      profit: 1200000.0,
    },
    {
      id: 'PC-003',
      name: 'B2B Wholesale',
      code: 'B2B-300',
      manager: 'Dwight Schrute',
      status: 'active',
      revenue: 1800000.0,
      profit: 450000.0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Profit Centers</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Track revenue generation and profitability by business units
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Profit Center
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Search profit centers..."
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
              <TableHead className="text-right">Revenue (YTD)</TableHead>
              <TableHead className="text-right">Profit (YTD)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profitCenters.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-sm text-on-surface-variant">
                  {item.code}
                </TableCell>
                <TableCell className="font-medium text-on-surface">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    {item.name}
                  </div>
                </TableCell>
                <TableCell>{item.manager}</TableCell>
                <TableCell className="text-right font-medium">
                  ₹{item.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-medium text-success">
                  ₹{item.profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge variant={item.status === 'active' ? 'primary' : 'default'}>
                    {item.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                    View Report
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
