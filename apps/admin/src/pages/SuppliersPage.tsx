import { useState, useEffect } from 'react';
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
import { Search, Filter, Plus, Truck, Building2, ExternalLink, Loader2, X } from 'lucide-react';

import { AdminService } from '@byteevolvr/api-client';

export function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppRes, poRes] = await Promise.all([
        AdminService.getSuppliers(),
        AdminService.getPurchaseOrders(),
      ]);
      setSuppliers(Array.isArray(suppRes?.data) ? suppRes.data : []);
      setPurchaseOrders(Array.isArray(poRes?.data) ? poRes.data : []);
    } catch (error) {
      console.error('Failed to fetch supplier data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.email) return;
    setIsSubmitting(true);
    try {
      await AdminService.createSupplier(formData);
      setIsModalOpen(false);
      setFormData({ name: '', contact_name: '', email: '', phone: '', address: '', status: 'active' });
      fetchData();
    } catch (err) {
      console.error('Failed to create supplier', err);
      alert('Failed to add supplier. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Supplier Management</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage vendor relationships and purchase orders
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-on-surface-variant font-medium text-sm mb-1">
                Active Suppliers
              </div>
              <div className="text-3xl font-bold text-on-surface">{suppliers.length}</div>
            </div>
            <Building2 className="h-8 w-8 text-on-surface-variant opacity-50" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-on-surface-variant font-medium text-sm mb-1">Pending POs</div>
              <div className="text-3xl font-bold text-primary">{purchaseOrders.filter(po => po.status === 'pending').length}</div>
            </div>
            <Truck className="h-8 w-8 text-primary opacity-50" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-on-surface-variant font-medium text-sm mb-1">
                Delayed Shipments
              </div>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-on-surface-variant">Loading suppliers...</TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-on-surface-variant">No suppliers found.</TableCell>
                </TableRow>
              ) : (
                (suppliers || []).filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium text-primary hover:underline cursor-pointer">
                      {supplier.name}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-on-surface">{supplier.contact_name}</div>
                      <div className="text-xs text-on-surface-variant">{supplier.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.status === 'active' ? 'success' : 'warning'}>
                        {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {purchaseOrders.filter(po => po.supplier_id === supplier.id).length}
                    </TableCell>
                    <TableCell className="text-on-surface-variant text-sm">
                      {purchaseOrders.filter(po => po.supplier_id === supplier.id)[0]?.created_at ? new Date(purchaseOrders.filter(po => po.supplier_id === supplier.id)[0]?.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <button className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-surface w-full max-w-[500px] shadow-xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="text-xl font-bold text-on-surface">Add New Supplier</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="rounded-full h-8 w-8 p-0">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <Input label="Supplier Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Acme Corp" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Contact Name" value={formData.contact_name} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} placeholder="John Doe" />
                <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@acme.com" />
              </div>
              <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 555-0199" />
              <Input label="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="123 Industrial Pkwy" />
            </div>

            <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isSubmitting || !formData.name}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Supplier
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
