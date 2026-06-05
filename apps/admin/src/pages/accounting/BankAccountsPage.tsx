import { useState } from 'react';
import { Card, Button, Input, Badge } from '@byteevolvr/ui';
import { Search, Plus, Building, MoreHorizontal, Filter } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';

export function BankAccountsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for initial UI shell
  const bankAccounts = [
    {
      id: 1,
      name: 'HDFC Current Account',
      bank: 'HDFC Bank',
      accountNumber: '****1234',
      balance: 1250000.5,
      currency: 'INR',
      status: 'active',
    },
    {
      id: 2,
      name: 'ICICI Savings Account',
      bank: 'ICICI Bank',
      accountNumber: '****5678',
      balance: 500000.0,
      currency: 'INR',
      status: 'active',
    },
    {
      id: 3,
      name: 'SBI Corporate',
      bank: 'State Bank of India',
      accountNumber: '****9012',
      balance: 25000.0,
      currency: 'INR',
      status: 'inactive',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Bank Accounts</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage your company bank accounts and integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Bank Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 flex items-center gap-4 border-l-4 border-l-primary">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Total Bank Balance</p>
            <h3 className="text-2xl font-bold text-on-surface">₹17,75,000.50</h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4 border-l-4 border-l-success">
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center text-success">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Active Accounts</p>
            <h3 className="text-2xl font-bold text-on-surface">2</h3>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Search accounts..."
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
              <TableHead>Account Name</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bankAccounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium text-on-surface">{account.name}</TableCell>
                <TableCell>{account.bank}</TableCell>
                <TableCell className="font-mono text-sm text-on-surface-variant">
                  {account.accountNumber}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {account.currency}{' '}
                  {account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge variant={account.status === 'active' ? 'primary' : 'secondary'}>
                    {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
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
