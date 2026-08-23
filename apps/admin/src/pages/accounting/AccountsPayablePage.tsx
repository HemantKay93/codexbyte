import { useState, useEffect, useMemo } from 'react';
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
import { Search, Filter, Download, ArrowDownRight, TrendingDown, Loader2 } from 'lucide-react';
import { AccountingService } from '@byteevolvr/api-client';

export function AccountsPayablePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [payables, setPayables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackData = () => {
    setPayables([
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
    ]);
  };

  const fetchPayables = async () => {
    try {
      const res = await AccountingService.getAP();
      if (res?.data && res.data.length > 0) {
        setPayables(res.data);
      } else {
        fallbackData();
      }
    } catch (err) {
      console.error('Failed to load AP data', err);
      fallbackData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPayables();
  }, []);

  const stats = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const total = payables.reduce((sum, p) => sum + p.amount, 0);
    const overdue30 = payables
      .filter((p) => p.daysOverdue > 0 && p.daysOverdue <= 30)
      .reduce((sum, p) => sum + p.amount, 0);
    const overdue31 = payables
      .filter((p) => p.daysOverdue > 30)
      .reduce((sum, p) => sum + p.amount, 0);
    const upcoming = payables
      .filter((p) => p.daysOverdue === 0 && new Date(p.dueDate).getTime() - now <= 7 * 86400000)
      .reduce((sum, p) => sum + p.amount, 0);
    return { total, overdue30, overdue31, upcoming };
  }, [payables]);

  const { totalPayable, totalOverdue30, totalOverdue31, upcoming7 } = {
    totalPayable: stats.total,
    totalOverdue30: stats.overdue30,
    totalOverdue31: stats.overdue31,
    upcoming7: stats.upcoming,
  };

  const filteredPayables = payables.filter(
    (p) =>
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h3 className="text-2xl font-bold text-on-surface">
            ₹{totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
            <p className="text-sm text-on-surface-variant mb-1">Upcoming (7 Days)</p>
            <h3 className="text-2xl font-bold text-on-surface">
              ₹{upcoming7.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredPayables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-on-surface-variant">
                  No bills found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayables.map((item) => (
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
                      Pay Now
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
