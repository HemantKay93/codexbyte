import { Card, Button } from '@byteevolvr/ui';
import { Download, FileText, Calendar } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';

export function TrialBalancePage() {
  // Mock data for Trial Balance
  const trialBalanceData = [
    { code: '1000', name: 'Cash and Bank Equivalents', debit: 1750000.5, credit: 0 },
    { code: '1200', name: 'Accounts Receivable', debit: 450000.0, credit: 0 },
    { code: '1500', name: 'Inventory', debit: 850000.0, credit: 0 },
    { code: '2000', name: 'Accounts Payable', debit: 0, credit: 320000.0 },
    { code: '2200', name: 'GST Payable', debit: 0, credit: 45000.0 },
    { code: '3000', name: 'Owner Equity', debit: 0, credit: 1500000.0 },
    { code: '4000', name: 'Sales Revenue', debit: 0, credit: 2800000.0 },
    { code: '5000', name: 'Cost of Goods Sold', debit: 1200000.0, credit: 0 },
    { code: '6000', name: 'Operating Expenses', debit: 415000.0, credit: 0 },
  ];

  const totalDebit = trialBalanceData.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = trialBalanceData.reduce((sum, item) => sum + item.credit, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Trial Balance</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">As of October 31, 2023</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Select Period
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-surface-container-low p-4 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2 text-on-surface">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-semibold">Trial Balance Report</span>
          </div>
          <div className="text-sm text-on-surface-variant">Currency: INR (₹)</div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Account Code</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead className="text-right w-48">Debit</TableHead>
              <TableHead className="text-right w-48">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trialBalanceData.map((item) => (
              <TableRow key={item.code} className="hover:bg-surface-container-lowest">
                <TableCell className="font-mono text-sm text-on-surface-variant">
                  {item.code}
                </TableCell>
                <TableCell className="font-medium text-on-surface">{item.name}</TableCell>
                <TableCell className="text-right">
                  {item.debit > 0
                    ? `₹${item.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {item.credit > 0
                    ? `₹${item.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
            {/* Totals Row */}
            <TableRow className="bg-surface-container-low hover:bg-surface-container-low font-bold">
              <TableCell colSpan={2} className="text-right text-on-surface">
                TOTAL
              </TableCell>
              <TableCell className="text-right text-on-surface border-t-2 border-outline">
                ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right text-on-surface border-t-2 border-outline">
                ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {totalDebit === totalCredit ? (
        <div className="p-4 bg-success/10 text-success rounded-lg flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success"></div>
          Trial balance is perfectly balanced.
        </div>
      ) : (
        <div className="p-4 bg-error/10 text-error rounded-lg flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-error"></div>
          Warning: Trial balance is out of balance by ₹
          {Math.abs(totalDebit - totalCredit).toLocaleString()}. Please check journal entries.
        </div>
      )}
    </div>
  );
}
