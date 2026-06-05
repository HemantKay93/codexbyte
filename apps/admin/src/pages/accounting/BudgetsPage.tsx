import { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import { Search, Plus, Filter, Target } from 'lucide-react';

export function BudgetsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for Budgets
  const budgets = [
    {
      id: 1,
      name: 'Q4 Marketing Budget',
      department: 'Marketing',
      allocated: 500000.0,
      utilized: 350000.0,
      remaining: 150000.0,
      status: 'on-track',
    },
    {
      id: 2,
      name: 'IT Infrastructure 2024',
      department: 'IT',
      allocated: 1200000.0,
      utilized: 1100000.0,
      remaining: 100000.0,
      status: 'warning',
    },
    {
      id: 3,
      name: 'Sales Travel Q1',
      department: 'Sales',
      allocated: 250000.0,
      utilized: 280000.0,
      remaining: -30000.0,
      status: 'exceeded',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Budgets</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage department budgets and track utilization
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Budget
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <p className="text-sm text-on-surface-variant mb-1">Total Allocated</p>
          <h3 className="text-2xl font-bold text-on-surface">₹19,50,000.00</h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-warning">
          <p className="text-sm text-on-surface-variant mb-1">Total Utilized</p>
          <h3 className="text-2xl font-bold text-warning">₹17,30,000.00</h3>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-on-surface-variant mb-1">Average Utilization</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: '88%' }}></div>
            </div>
            <span className="text-sm font-bold text-on-surface">88%</span>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Search budgets..."
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
              <TableHead>Budget Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Allocated</TableHead>
              <TableHead className="text-right">Utilized</TableHead>
              <TableHead className="w-48">Progress</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgets.map((item) => {
              const percent = Math.min((item.utilized / item.allocated) * 100, 100);
              const isOver = item.utilized > item.allocated;

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-on-surface">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-on-surface-variant" />
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{item.allocated.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{item.utilized.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isOver ? 'bg-error' : percent > 85 ? 'bg-warning' : 'bg-success'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-on-surface-variant w-8">
                        {percent.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
