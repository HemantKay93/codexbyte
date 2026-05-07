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
  RefreshCcw,
  Check,
  X,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { AdminService } from '@byteevolvr/api-client';
import { useNavigate } from 'react-router-dom';

export function ReturnsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  async function fetchReturns() {
    setLoading(true);
    try {
      const data = await AdminService.getRmaReturns();
      // data from backend ReturnService returns: *, user_profiles(full_name), orders(order_number)
      const mappedData = data?.map((r: any) => ({
        ...r,
        user: r.user_profiles,
        order: r.orders,
      }));
      setReturns(mappedData || []);
    } catch (err) {
      console.error('Error fetching returns:', err);
    } finally {
      setLoading(false);
    }
  }

  const updateReturnStatus = async (id: string, newStatus: string) => {
    setProcessingId(id);
    try {
      await AdminService.updateRmaStatus(id, { status: newStatus });
      await fetchReturns();
    } catch (err) {
      console.error('Error updating return status:', err);
      alert('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReturns = returns.filter(
    (r) =>
      r.rma_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.order?.order_number &&
        r.order.order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.user?.full_name && r.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    pending: returns.filter((r) => r.status === 'pending').length,
    approved: returns.filter((r) => r.status === 'approved').length,
    rejected: returns.filter((r) => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Returns & Refunds</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage RMAs and process customer refunds
          </p>
        </div>
        <Button className="gap-2" onClick={fetchReturns}>
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-2">
        <Card className="min-w-[250px] flex-1 border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-primary font-medium text-sm mb-1">Pending Approval</div>
              <div className="text-3xl font-bold text-primary">{stats.pending}</div>
            </div>
            <AlertCircle className="h-8 w-8 text-primary opacity-50" />
          </CardContent>
        </Card>
        <Card className="min-w-[250px] flex-1">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-on-surface-variant font-medium text-sm mb-1">Approved</div>
              <div className="text-3xl font-bold text-on-surface">{stats.approved}</div>
            </div>
            <Check className="h-8 w-8 text-success opacity-50" />
          </CardContent>
        </Card>
        <Card className="min-w-[250px] flex-1">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-on-surface-variant font-medium text-sm mb-1">Rejected</div>
              <div className="text-3xl font-bold text-on-surface">{stats.rejected}</div>
            </div>
            <X className="h-8 w-8 text-error opacity-50" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
              <Input
                placeholder="Search RMAs, orders or customers..."
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
                <TableHead>RMA Number</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <span className="text-sm text-on-surface-variant mt-2 block">
                      Loading returns...
                    </span>
                  </TableCell>
                </TableRow>
              ) : filteredReturns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-on-surface-variant">
                    No returns found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReturns.map((rma) => (
                  <TableRow key={rma.id}>
                    <TableCell className="font-medium text-on-surface">{rma.rma_number}</TableCell>
                    <TableCell
                      className="text-primary hover:underline cursor-pointer flex items-center gap-1"
                      onClick={() => navigate(`/orders/${rma.order_id}`)}
                    >
                      {rma.order?.order_number} <ExternalLink className="h-3 w-3" />
                    </TableCell>
                    <TableCell className="text-on-surface-variant">
                      {rma.user?.full_name || 'Walk-in Customer'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-on-surface">{rma.reason}</div>
                      {rma.condition && (
                        <div className="text-xs text-on-surface-variant mt-0.5">
                          Condition: {rma.condition}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-on-surface-variant text-sm">
                      {new Date(rma.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          rma.status === 'approved' || rma.status === 'refunded'
                            ? 'success'
                            : rma.status === 'rejected'
                              ? 'error'
                              : 'warning'
                        }
                      >
                        {rma.status.charAt(0).toUpperCase() + rma.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {rma.status === 'pending' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-success hover:bg-success/10"
                              onClick={() => updateReturnStatus(rma.id, 'approved')}
                              disabled={processingId === rma.id}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-error hover:bg-error/10"
                              onClick={() => updateReturnStatus(rma.id, 'rejected')}
                              disabled={processingId === rma.id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : rma.status === 'approved' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => updateReturnStatus(rma.id, 'refunded')}
                            disabled={processingId === rma.id}
                          >
                            Process Refund
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/orders/${rma.order_id}`)}
                          >
                            View Order
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
