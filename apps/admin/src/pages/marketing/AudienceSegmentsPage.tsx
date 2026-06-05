import { useState } from 'react';
import { Card, Button, Input, Badge } from '@byteevolvr/ui';
import { Search, Plus, Filter, Users } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';

export function AudienceSegmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const segments = [
    {
      id: 'SEG-001',
      name: 'VIP Customers',
      conditions: 'Total Spend > $1000',
      size: 1245,
      lastCalculated: '2 hours ago',
      status: 'active',
    },
    {
      id: 'SEG-002',
      name: 'Churn Risk',
      conditions: 'No orders in 90 days',
      size: 856,
      lastCalculated: '1 day ago',
      status: 'active',
    },
    {
      id: 'SEG-003',
      name: 'Newsletter Subscribers',
      conditions: 'Opt-in = true',
      size: 15200,
      lastCalculated: '10 mins ago',
      status: 'active',
    },
    {
      id: 'SEG-004',
      name: 'Holiday Shoppers 2022',
      conditions: 'Order Date between Nov 1 - Dec 31 2022',
      size: 3400,
      lastCalculated: 'Never',
      status: 'inactive',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Audience Segments</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Build dynamic customer lists for targeted marketing campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Segment
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Search segments..."
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
              <TableHead>Segment Name</TableHead>
              <TableHead>Logic / Conditions</TableHead>
              <TableHead className="text-right">Size (Users)</TableHead>
              <TableHead>Last Calculated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {segments.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary hover:underline cursor-pointer">
                      {item.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-on-surface-variant max-w-[200px] truncate">
                  {item.conditions}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {item.size.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-on-surface-variant">
                  {item.lastCalculated}
                </TableCell>
                <TableCell>
                  <Badge variant={item.status === 'active' ? 'success' : 'default'}>
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
