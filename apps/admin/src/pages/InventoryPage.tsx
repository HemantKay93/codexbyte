import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Input,
} from '../components/ui';
import {
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  Download,
  Upload,
  Loader2,
  Save,
  UploadCloud,
  Plus,
} from 'lucide-react';
import { useAdminStore } from '@byteevolvr/store';
import { AdminService } from '@byteevolvr/api-client';
import { BulkImportDialog } from '../components/BulkImportDialog';
import { StockAdjustmentModal } from '../components/StockAdjustmentModal';
import { useAdmin } from '../modules/admin/hooks/useAdmin';

export function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { products, setProducts, isLoading, setLoading, setError } = useAdminStore();
  const { fetchWarehouses } = useAdmin();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchWarehouses();
  }, []);

  async function fetchInventory() {
    setLoading(true);
    try {
      const data = await AdminService.getProducts();
      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError(err.customMessage || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }

  const exportToCSV = () => {
    const headers = ['Product', 'SKU', 'Available Stock', 'Price', 'Status'];
    const rows = products.map((p) => [p.name, p.sku, p.stock_quantity, p.price, p.status]);

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(
    (p) =>
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: products.length,
    lowStock: products.filter((p) => p.stock_quantity > 0 && p.stock_quantity < 10).length,
    outOfStock: products.filter((p) => p.stock_quantity <= 0).length,
    totalValue: products.reduce((acc, p) => acc + Number(p.price) * (p.stock_quantity || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Inventory Hub</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Real-time stock monitoring across all warehouses
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setIsImportDialogOpen(true)}>
            <UploadCloud className="h-4 w-4" /> Bulk Import
          </Button>
          <Button variant="outline" className="gap-2" onClick={exportToCSV}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <BulkImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onSuccess={fetchInventory}
      />

      {selectedProduct && (
        <StockAdjustmentModal
          product={selectedProduct}
          isOpen={isAdjustmentModalOpen}
          onClose={() => {
            setIsAdjustmentModalOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={fetchInventory}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-surface-container-lowest">
          <CardContent className="p-6">
            <div className="text-on-surface-variant font-black text-[10px] uppercase tracking-widest mb-2">
              Total SKUs
            </div>
            <div className="text-4xl font-black text-on-surface tracking-tighter">
              {stats.total}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-warning/5 border-l-4 border-l-warning">
          <CardContent className="p-6">
            <div className="text-warning font-black text-[10px] uppercase tracking-widest mb-2">
              Low Stock Alerts
            </div>
            <div className="text-4xl font-black text-warning tracking-tighter">
              {stats.lowStock}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-error/5 border-l-4 border-l-error">
          <CardContent className="p-6">
            <div className="text-error font-black text-[10px] uppercase tracking-widest mb-2">
              Out of Stock
            </div>
            <div className="text-4xl font-black text-error tracking-tighter">
              {stats.outOfStock}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-primary/5 border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="text-primary font-black text-[10px] uppercase tracking-widest mb-2">
              Inventory Value
            </div>
            <div className="text-4xl font-black text-primary tracking-tighter">
              ₹{stats.totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 max-md w-full">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant" />
              <Input
                placeholder="Search products or SKUs..."
                className="pl-10 h-10 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-container-lowest">
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                  Product
                </TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                  SKU
                </TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                  Status
                </TableHead>
                <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">
                  Total Qty
                </TableHead>
                <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">
                  Price
                </TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-sm font-medium text-on-surface-variant">
                      Syncing inventory levels...
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-surface-container-lowest transition-colors"
                  >
                    <TableCell>
                      <div className="font-bold text-on-surface">{item.name}</div>
                      <div className="text-[10px] text-on-surface-variant font-medium">
                        {item.category}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                      {item.sku}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.stock_quantity > 10
                            ? 'success'
                            : item.stock_quantity > 0
                              ? 'warning'
                              : 'error'
                        }
                        className="rounded-full px-3 py-0.5"
                      >
                        {item.stock_quantity > 10
                          ? 'In Stock'
                          : item.stock_quantity > 0
                            ? 'Low Stock'
                            : 'Out of Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-black text-on-surface">
                      {item.stock_quantity}
                    </TableCell>
                    <TableCell className="text-right text-on-surface-variant font-bold">
                      ₹{Number(item.price).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            setSelectedProduct(item);
                            setIsAdjustmentModalOpen(true);
                          }}
                          title="Adjust Stock"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <button className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 border-t border-outline-variant flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          <div>
            Showing {filteredProducts.length} of {products.length} items
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="h-8 rounded-lg" disabled>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
