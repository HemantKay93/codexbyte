import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Input } from '../components/ui';
import { Search, Filter, MoreHorizontal, ArrowUpDown, Download, Upload, Loader2, Save, UploadCloud } from 'lucide-react';
import { useAdminStore } from '@byteevolvr/store';
import { AdminService, ProductService } from '@byteevolvr/api-client';
import { BulkImportDialog } from '../components/BulkImportDialog';

export function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { products, setProducts, isLoading, setLoading, setError } = useAdminStore();
  const [saving, setSaving] = useState(false);
  const [editedStock, setEditedStock] = useState<Record<string, number>>({});
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  useEffect(() => {
    fetchInventory();
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

  const handleStockChange = (productId: string, newValue: number) => {
    setEditedStock(prev => ({
      ...prev,
      [productId]: newValue
    }));
  };

  const saveStockUpdates = async () => {
    if (Object.keys(editedStock).length === 0) return;
    setSaving(true);
    try {
      for (const [id, stock] of Object.entries(editedStock)) {
        await ProductService.updateProduct(id, { stock_quantity: stock });
      }
      setEditedStock({});
      await fetchInventory();
      alert('Stock updated successfully!');
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Failed to update stock.');
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Product', 'SKU', 'Available Stock', 'Price', 'Status'];
    const rows = products.map(p => [
      p.name,
      p.sku,
      p.stock_quantity,
      p.price,
      p.status
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length,
    outOfStock: products.filter(p => p.stock_quantity <= 0).length,
    totalValue: products.reduce((acc, p) => acc + (Number(p.price) * (p.stock_quantity || 0)), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Inventory Management</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Track and update stock levels across locations</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setIsImportDialogOpen(true)}>
            <UploadCloud className="h-4 w-4" /> Bulk Import
          </Button>
          <Button variant="outline" className="gap-2" onClick={exportToCSV}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button 
            className="gap-2" 
            onClick={saveStockUpdates} 
            disabled={saving || Object.keys(editedStock).length === 0}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <BulkImportDialog 
        isOpen={isImportDialogOpen} 
        onClose={() => setIsImportDialogOpen(false)} 
        onSuccess={fetchInventory} 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-on-surface-variant font-medium text-sm mb-1">Total SKUs</div>
            <div className="text-3xl font-bold text-on-surface">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-on-surface-variant font-medium text-sm mb-1">Low Stock Alerts</div>
            <div className="text-3xl font-bold text-warning">{stats.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-on-surface-variant font-medium text-sm mb-1">Out of Stock</div>
            <div className="text-3xl font-bold text-error">{stats.outOfStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-on-surface-variant font-medium text-sm mb-1">Inventory Value</div>
            <div className="text-3xl font-bold text-primary">₹{stats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 max-md w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
              <Input
                placeholder="Search products or SKUs..."
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
                <TableHead>Product <ArrowUpDown className="h-3 w-3 inline ml-1" /></TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredProducts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-on-surface">{item.name}</TableCell>
                  <TableCell className="font-mono text-xs text-on-surface-variant uppercase">{item.sku}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.stock_quantity > 10 ? 'success' :
                        item.stock_quantity > 0 ? 'warning' : 'error'
                      }
                    >
                      {item.stock_quantity > 10 ? 'In Stock' : item.stock_quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <input 
                      type="number" 
                      value={editedStock[item.id] !== undefined ? editedStock[item.id] : item.stock_quantity} 
                      onChange={(e) => handleStockChange(item.id, parseInt(e.target.value) || 0)}
                      className={`w-20 h-9 px-2 text-right border rounded ${item.stock_quantity < 10 ? 'border-error/50 text-error bg-error/5' : 'border-outline bg-surface'} focus:ring-2 focus:ring-primary focus:outline-none transition-all`}
                    />
                  </TableCell>
                  <TableCell className="text-right text-on-surface-variant font-medium">₹{Number(item.price).toLocaleString()}</TableCell>
                  <TableCell>
                    <button className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 border-t border-outline-variant flex items-center justify-between text-sm text-on-surface-variant">
          <div>Showing {filteredProducts.length} of {products.length} items</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
