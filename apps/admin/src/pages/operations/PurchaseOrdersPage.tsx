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
import { Search, Plus, Filter, FileCheck, ArrowRight, PackageOpen, FileText } from 'lucide-react';

export function PurchaseOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'grn'>('orders');

  // Mock data
  const orders = [
    {
      id: 'PO-2023-104',
      vendor: 'TechSupplies Inc.',
      date: '2023-10-16',
      expectedDelivery: '2023-10-25',
      amount: 125000.0,
      status: 'issued',
    },
    {
      id: 'PO-2023-105',
      vendor: 'Office Rentals LLC',
      date: '2023-10-18',
      expectedDelivery: '2023-10-20',
      amount: 45000.0,
      status: 'received',
    },
    {
      id: 'PO-2023-106',
      vendor: 'Global Networks',
      date: '2023-10-21',
      expectedDelivery: '2023-11-05',
      amount: 350000.0,
      status: 'draft',
    },
  ];

  const grns = [
    {
      id: 'GRN-2023-011',
      poId: 'PO-2023-104',
      vendor: 'TechSupplies Inc.',
      dateReceived: '2023-10-25',
      receivedBy: 'Warehouse A',
      status: 'pending_inspection',
    },
    {
      id: 'GRN-2023-010',
      poId: 'PO-2023-105',
      vendor: 'Office Rentals LLC',
      dateReceived: '2023-10-20',
      receivedBy: 'Warehouse B',
      status: 'completed',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">
            Purchase Orders & Receipts
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage orders sent to vendors and track incoming goods (GRN)
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create PO
          </Button>
        </div>
      </div>

      <div className="flex border-b border-outline-variant mb-6">
        <button
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => setActiveTab('orders')}
        >
          All Orders
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'grn' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => setActiveTab('grn')}
        >
          Goods Receipt Notes (GRN)
        </button>
      </div>

      {activeTab === 'orders' && (
        <Card>
          <div className="flex items-center justify-between p-4 border-b border-outline-variant">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
              <Input
                placeholder="Search POs or vendors..."
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
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary hover:underline cursor-pointer">
                        {item.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{item.vendor}</TableCell>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-on-surface-variant">
                      <ArrowRight className="h-3 w-3" />
                      {new Date(item.expectedDelivery).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === 'ordered'
                          ? 'primary'
                          : item.status === 'received'
                            ? 'success'
                            : 'default'
                      }
                    >
                      {item.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === 'issued' ? (
                      <Button variant="outline" size="sm" className="gap-2 text-xs">
                        <PackageOpen className="h-3 w-3" /> Create GRN
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                        View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {activeTab === 'grn' && (
        <Card>
          <div className="p-4 border-b border-outline-variant">
            <h3 className="font-semibold">Goods Receipt Notes (GRN)</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>GRN ID</TableHead>
                <TableHead>Linked PO</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date Received</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grns.map((grn) => (
                <TableRow key={grn.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-on-surface-variant" />
                      <span className="font-medium text-primary hover:underline cursor-pointer">
                        {grn.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-mono text-on-surface-variant">
                    {grn.poId}
                  </TableCell>
                  <TableCell>{grn.vendor}</TableCell>
                  <TableCell>{new Date(grn.dateReceived).toLocaleDateString()}</TableCell>
                  <TableCell>{grn.receivedBy}</TableCell>
                  <TableCell>
                    <Badge variant={grn.status === 'completed' ? 'success' : 'warning'}>
                      {grn.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
