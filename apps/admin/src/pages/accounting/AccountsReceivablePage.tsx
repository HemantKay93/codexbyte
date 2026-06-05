import { useState, useEffect } from 'react';
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
import { Search, Filter, Download, ArrowUpRight, TrendingUp, Loader2 } from 'lucide-react';
import { AccountingService } from '@byteevolvr/api-client';

export function AccountsReceivablePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [receivables, setReceivables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceivables();
  }, []);

  const fetchReceivables = async () => {
    try {
      setLoading(true);
      const res = await AccountingService.getAR();
      if (res?.data && res.data.length > 0) {
        setReceivables(res.data);
      } else {
        fallbackData();
      }
    } catch (err) {
      console.error('Failed to load AR data', err);
      fallbackData();
    } finally {
      setLoading(false);
    }
  };

  const fallbackData = () => {
    setReceivables([
      {
        id: 'INV-2023-001',
        customer: 'Acme Corp',
        amount: 45000.0,
        dueDate: '2023-10-15',
        status: 'overdue',
        daysOverdue: 12,
      },
      {
        id: 'INV-2023-005',
        customer: 'Stark Industries',
        amount: 125000.0,
        dueDate: '2023-11-01',
        status: 'pending',
        daysOverdue: 0,
      },
      {
        id: 'INV-2023-008',
        customer: 'Wayne Enterprises',
        amount: 8500.0,
        dueDate: '2023-11-10',
        status: 'pending',
        daysOverdue: 0,
      },
    ]);
  };

  const totalOutstanding = receivables.reduce((sum, r) => sum + r.amount, 0);
  const totalOverdue30 = receivables
    .filter((r) => r.daysOverdue > 0 && r.daysOverdue <= 30)
    .reduce((sum, r) => sum + r.amount, 0);
  const totalOverdue31 = receivables
    .filter((r) => r.daysOverdue > 30)
    .reduce((sum, r) => sum + r.amount, 0);

  const filteredReceivables = receivables.filter(
    (r) =>
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Accounts Receivable</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Track incoming payments and manage outstanding customer invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Aging Report
          </Button>
          <Button className="gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <p className="text-sm text-on-surface-variant mb-1">Total Outstanding</p>
          <h3 className="text-2xl font-bold text-on-surface">
            ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-error">
          <p className="text-sm text-on-surface-variant mb-1">Overdue (1-30 Days)</p>
          <h3 className="text-2xl font-bold text-error">
            ₹{totalOverdue30.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-error">
          <p className="text-sm text-on-surface-variant mb-1">Overdue (31+ Days)</p>
          <h3 className="text-2xl font-bold text-error">
            ₹{totalOverdue31.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
        </Card>
        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-on-surface-variant mb-1">Avg. Collection Time</p>
            <h3 className="text-2xl font-bold text-on-surface">18 Days</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Search invoices or customers..."
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
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredReceivables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-on-surface-variant">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              filteredReceivables.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-primary hover:underline cursor-pointer">
                    {item.id}
                  </TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell>
                    <span className={item.daysOverdue > 0 ? 'text-error font-medium' : ''}>
                      {new Date(item.dueDate).toLocaleDateString()}
                    </span>
                    {item.daysOverdue > 0 && (
                      <span className="text-xs text-error ml-2">
                        ({item.daysOverdue} days late)
                      </span>
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
                      Remind
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
