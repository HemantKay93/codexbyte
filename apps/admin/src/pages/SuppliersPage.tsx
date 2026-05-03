import React, { useState } from 'react';
import { Card, CardContent, Button, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Input } from '../components/ui';
import { Search, Filter, Plus, Truck, Building2, ExternalLink } from 'lucide-react';

const mockSuppliers = [
  { id: '1', name: 'TechComponent Solutions', contact: 'Alice Chen', email: 'alice@techcomp.io', status: 'active', orders: 12, lastOrder: '2026-04-15' },
  { id: '2', name: 'Global Peripherals Ltd', contact: 'Bob Martin', email: 'sales@globalperipherals.com', status: 'active', orders: 45, lastOrder: '2026-05-01' },
  { id: '3', name: 'Premium Audio Co', contact: 'Diana Prince', email: 'orders@premiumaudio.co', status: 'pending', orders: 0, lastOrder: 'N/A' },
];

export function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Supplier Management</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Manage vendor relationships and purchase orders</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-on-surface-variant font-medium text-sm mb-1">Active Suppliers</div>
              <div className="text-3xl font-bold text-on-surface">24</div>
            </div>
            <Building2 className="h-8 w-8 text-on-surface-variant opacity-50" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-on-surface-variant font-medium text-sm mb-1">Pending POs</div>
              <div className="text-3xl font-bold text-primary">5</div>
            </div>
            <Truck className="h-8 w-8 text-primary opacity-50" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-on-surface-variant font-medium text-sm mb-1">Delayed Shipments</div>
              <div className="text-3xl font-bold text-error">2</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
              <Input
                placeholder="Search suppliers..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total POs</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium text-primary hover:underline cursor-pointer">{supplier.name}</TableCell>
                  <TableCell>
                    <div className="text-sm text-on-surface">{supplier.contact}</div>
                    <div className="text-xs text-on-surface-variant">{supplier.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={supplier.status === 'active' ? 'success' : 'warning'}>
                      {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{supplier.orders}</TableCell>
                  <TableCell className="text-on-surface-variant text-sm">{supplier.lastOrder}</TableCell>
                  <TableCell>
                    <button className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
