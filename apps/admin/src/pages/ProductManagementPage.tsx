import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Input } from '@byteevolvr/ui';
import { Plus, Filter, Search, UploadCloud, Edit } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/Table';
import { BulkImportDialog } from '../components/BulkImportDialog';
import { useProduct } from '../modules/product/hooks/useProduct';

export function ProductManagementPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { products, fetchProducts, loading } = useProduct();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-line @typescript-eslint/no-floating-promises
  }, []);
  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Products</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setIsImportDialogOpen(true)}>
            <UploadCloud className="h-4 w-4" />
            Bulk Import
          </Button>
          <Button className="gap-2" onClick={() => navigate('/products/new')}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <BulkImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onSuccess={fetchProducts}
      />

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-outline text-primary focus:ring-primary"
                  />
                </TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-on-surface-variant">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        className="rounded border-outline text-primary focus:ring-primary"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-on-surface">{product.name}</TableCell>
                    <TableCell className="text-on-surface-variant font-mono text-xs">
                      {product.sku}
                    </TableCell>
                    <TableCell className="text-right text-on-surface">
                      {Number(product.price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          product.stock_quantity === 0
                            ? 'text-error font-medium'
                            : product.stock_quantity < 20
                              ? 'text-amber-600 font-medium'
                              : 'text-on-surface'
                        }
                      >
                        {product.stock_quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === 'active'
                            ? 'success'
                            : product.status === 'out_of_stock'
                              ? 'error'
                              : 'warning'
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                        className="text-on-surface-variant hover:text-primary p-2 rounded-md hover:bg-primary/10 transition-colors flex items-center gap-1 text-sm font-medium"
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t border-outline-variant flex items-center justify-between text-sm text-on-surface-variant">
          <div>Showing {products.length} products</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
