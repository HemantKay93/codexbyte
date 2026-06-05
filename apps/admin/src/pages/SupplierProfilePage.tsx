import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import { AdminService } from '@byteevolvr/api-client';
import { Building2, Mail, Phone, MapPin, ArrowLeft, FileText, Loader2 } from 'lucide-react';

export function SupplierProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState<any>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSupplierData(id);
    }
  }, [id]);

  const fetchSupplierData = async (supplierId: string) => {
    setLoading(true);
    try {
      const [suppRes, poRes] = await Promise.all([
        AdminService.getSupplierById(supplierId),
        AdminService.getPurchaseOrders(supplierId),
      ]);
      setSupplier(suppRes);
      setPurchaseOrders(Array.isArray(poRes) ? poRes : []);
    } catch (error) {
      console.error('Failed to fetch supplier details', error);
      alert('Failed to load supplier details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-xl font-bold text-on-surface">Supplier not found</h2>
        <Button variant="outline" onClick={() => navigate('/suppliers')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Suppliers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/suppliers')}
          className="p-2 h-10 w-10 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-on-surface" />
        </Button>
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">{supplier.name}</h1>
          <p className="text-body-sm text-on-surface-variant mt-1 flex items-center gap-2">
            Supplier Profile
            <Badge variant={supplier.status === 'active' ? 'success' : 'warning'}>
              {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
            </Badge>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-outline-variant">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-lg">
                  {supplier.contact_name || 'No Contact Person'}
                </h3>
                <p className="text-sm text-on-surface-variant">Primary Contact</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-on-surface-variant mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-on-surface">Email Address</p>
                  <p className="text-sm text-on-surface-variant break-all">
                    {supplier.email || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-on-surface-variant mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-on-surface">Phone Number</p>
                  <p className="text-sm text-on-surface-variant">{supplier.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-on-surface-variant mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-on-surface">Address</p>
                  <p className="text-sm text-on-surface-variant">{supplier.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2 flex flex-col h-full">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Purchase Orders
            </h2>
            <div className="text-sm font-medium px-3 py-1 bg-surface-container rounded-full text-on-surface-variant">
              Total: {purchaseOrders.length}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Total ($)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-on-surface-variant">
                      No purchase orders found for this supplier.
                    </TableCell>
                  </TableRow>
                ) : (
                  purchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium text-on-surface">
                        {po.id.split('-')[0].toUpperCase()}
                      </TableCell>
                      <TableCell className="text-on-surface-variant">
                        {new Date(po.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-on-surface-variant">
                        {po.expected_delivery
                          ? new Date(po.expected_delivery).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-on-surface font-medium">
                        ${Number(po.total_amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            po.status === 'received'
                              ? 'success'
                              : po.status === 'pending'
                                ? 'warning'
                                : 'default'
                          }
                        >
                          {po.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
