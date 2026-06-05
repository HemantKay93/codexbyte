import { useState } from 'react';
import {
  Card,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import { Plus, Calendar, Settings, MoreHorizontal } from 'lucide-react';

export function FinancialYearPage() {
  const [years] = useState([
    { id: 1, name: 'FY 2023-24', startDate: '2023-04-01', endDate: '2024-03-31', status: 'closed' },
    { id: 2, name: 'FY 2024-25', startDate: '2024-04-01', endDate: '2025-03-31', status: 'active' },
    {
      id: 3,
      name: 'FY 2025-26',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      status: 'upcoming',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Financial Years</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage accounting periods and year-end closing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Closing Settings
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Financial Year
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {years.map((year) => (
              <TableRow key={year.id}>
                <TableCell className="font-medium text-on-surface flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-on-surface-variant" />
                  {year.name}
                </TableCell>
                <TableCell>{new Date(year.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(year.endDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      year.status === 'active'
                        ? 'primary'
                        : year.status === 'upcoming'
                          ? 'secondary'
                          : 'default'
                    }
                  >
                    {year.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <button className="p-2 hover:bg-surface-container rounded-md text-on-surface-variant">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
