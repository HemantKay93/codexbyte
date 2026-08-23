import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Input } from '@byteevolvr/ui';
import { printInvoice } from '@byteevolvr/ui';
import {
  ArrowLeft,
  Printer,
  Package,
  Truck,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  X,
  ChevronDown,
  RotateCcw,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import { AdminService, CMSService } from '@byteevolvr/api-client';

import { useAdmin } from '../modules/admin/hooks/useAdmin';
import { OrderActivityLogs } from '../components/OrderActivityLogs';

import { OrderItemsTable } from './orders/components/OrderItemsTable';
import { OrderStatusStepper } from './orders/components/OrderStatusStepper';

export function OrderDetailPage() {
  // eslint-disable-line complexity
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    fetchOrderDetail,
    updateOrderStatus,
    fetchWarehouses,
    warehouses,
    isUpdating,
    isLoading: hookLoading,
  } = useAdmin();

  const [order, setOrder] = useState<any>(null);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courier, setCourier] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnRefundAmount, setReturnRefundAmount] = useState('');
  const [returnItems, setReturnItems] = useState<
    { productId: string; quantity: number; maxQty: number; name: string }[]
  >([]);
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);
  const [refreshLogsKey, setRefreshLogsKey] = useState(0);

  const loadData = async () => {
    if (!id) return;
    const data = await fetchOrderDetail(id);
    if (data) {
      setOrder(data);
      const shipment = data.shipments?.[0] || data.shipments;
      setTrackingNumber(shipment?.tracking_id || '');
      setCourier(shipment?.courier_name || '');
    }
    await fetchWarehouses();
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdateStatus = async (status: string, extra: any = {}) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!id) return;
    try {
      await updateOrderStatus(id, { status, ...extra });
      await loadData();
      setRefreshLogsKey((prev) => prev + 1);
      setShowFulfillModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openReturnModal = () => {
    const items = order?.order_items || [];
    setReturnItems(
      items.map((item: any) => ({
        // eslint-disable-line @typescript-eslint/no-explicit-any
        productId: item.product_id,
        name: item.product_name,
        quantity: item.quantity,
        maxQty: item.quantity,
      }))
    );
    setReturnReason('');
    setReturnRefundAmount('');
    setShowReturnModal(true);
  };

  const handleProcessReturn = async () => {
    if (!id || !selectedWarehouse || !returnReason.trim()) return;
    setIsProcessingReturn(true);
    try {
      const itemsToReturn = returnItems.filter((i) => i.quantity > 0);
      if (itemsToReturn.length === 0) {
        alert('Select at least one item to return.');
        return;
      }
      await AdminService.processReturn(id, {
        items: itemsToReturn.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        warehouseId: selectedWarehouse,
        reason: returnReason,
        refundAmount: returnRefundAmount ? Number(returnRefundAmount) : undefined,
      });
      setShowReturnModal(false);
      await loadData();
      setRefreshLogsKey((prev) => prev + 1);
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Return processing failed:', err);
      alert(err?.response?.data?.message || 'Failed to process return.');
    } finally {
      setIsProcessingReturn(false);
    }
  };

  const handlePrint = async () => {
    if (!order) return;
    try {
      const cmsData = await CMSService.getContent('global');
      printInvoice(order, order.order_items || [], cmsData);
    } catch (err) {
      console.error('Failed to get settings for invoice', err);
      printInvoice(order, order.order_items || []);
    }
  };

  if (loading || hookLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-on-surface-variant">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Retrieving Order Manifest...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Button onClick={() => navigate('/orders')} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  const items = order.order_items || [];
  const address = order.addresses?.[0] || order.addresses;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders')}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase italic">
                {order.order_number}
              </h1>
              <Badge
                variant={
                  order.status === 'delivered' || order.status === 'refunded'
                    ? 'success'
                    : order.status === 'shipped' ||
                        order.status === 'packed' ||
                        order.status === 'confirmed'
                      ? 'primary'
                      : order.status === 'cancelled'
                        ? 'error'
                        : 'warning'
                }
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              <Badge
                variant={
                  order.payment_status === 'paid' || order.payment_status === 'captured'
                    ? 'success'
                    : 'warning'
                }
              >
                {order.payment_status === 'paid' || order.payment_status === 'captured'
                  ? 'PAID'
                  : 'PENDING'}
              </Badge>
            </div>
            <p className="text-sm text-on-surface-variant font-medium">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>

          {['pending', 'confirmed', 'packed'].includes(order.status) && (
            <Button
              variant="outline"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={() => {
                if (
                  window.confirm(
                    'Are you sure you want to cancel this order? This action cannot be undone.'
                  )
                ) {
                  handleUpdateStatus('cancelled');
                  // eslint-disable-line @typescript-eslint/no-floating-promises
                }
              }}
              disabled={isUpdating}
            >
              <X className="h-4 w-4" />
              Cancel Order
            </Button>
          )}

          {order.status === 'confirmed' && (
            <Button
              variant="outline"
              className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
              onClick={() => handleUpdateStatus('packed')}
              disabled={isUpdating}
            >
              <Package className="h-4 w-4" />
              Mark as Packed
            </Button>
          )}

          {order.status === 'pending' && (
            <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => handleUpdateStatus('confirmed')}
              disabled={isUpdating}
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm Order
            </Button>
          )}

          {['pending', 'confirmed', 'packed'].includes(order.status) && (
            <Button
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setShowFulfillModal(true)}
              disabled={isUpdating}
            >
              <Truck className="h-4 w-4" />
              Dispatch Order
            </Button>
          )}

          {['shipped'].includes(order.status) && (
            <Button
              variant="outline"
              className="gap-2 text-blue-600 border-blue-200"
              onClick={() => handleUpdateStatus('delivered')}
              disabled={isUpdating}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark Delivered
            </Button>
          )}

          {['delivered', 'shipped'].includes(order.status) && (
            <Button
              variant="outline"
              className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/20"
              onClick={openReturnModal}
              disabled={isUpdating}
            >
              <RotateCcw className="h-4 w-4" />
              Process Return
            </Button>
          )}

          {order.status === 'returned' && (
            <Button
              variant="outline"
              className="gap-2 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950/20"
              onClick={() => handleUpdateStatus('refunded')}
              disabled={isUpdating}
            >
              <DollarSign className="h-4 w-4" />
              Process Refund
            </Button>
          )}
        </div>
      </div>

      {/* Status Stepper */}
      <OrderStatusStepper status={order.status} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Card */}
          <OrderItemsTable items={items} />

          {/* Activity Logs Timeline */}
          <Card className="border-none shadow-sm">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-lg font-bold text-on-surface">Order Timeline</h2>
              <RefreshCcw
                className="h-4 w-4 text-on-surface-variant cursor-pointer"
                onClick={() => loadData()}
              />
            </div>
            <div className="p-8">
              <OrderActivityLogs orderId={id!} key={refreshLogsKey} />
            </div>
          </Card>
        </div>

        {/* Right Column - Sidebar (same as before) */}
        <div className="space-y-6">
          {/* Customer Card */}
          <Card className="border-none shadow-sm">
            <div className="p-6 border-b border-outline-variant">
              <h2 className="text-lg font-bold text-on-surface">Customer Detail</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                  {(order.customer_name || 'C').charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-on-surface text-lg">
                    {order.customer_name || 'Guest User'}
                  </div>
                  <div className="text-sm text-on-surface-variant">
                    {order.customer_email || 'No email provided'}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant">
                <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">
                  Shipping Destination
                </h4>
                {address ? (
                  <div className="text-sm space-y-1">
                    <p className="font-bold text-on-surface">{address.full_name}</p>
                    <p className="text-on-surface-variant">{address.line_1}</p>
                    {address.line_2 && <p className="text-on-surface-variant">{address.line_2}</p>}
                    <p className="text-on-surface-variant">
                      {address.city}, {address.state} - {address.postal_code}
                    </p>
                    <p className="text-on-surface-variant font-bold mt-2">Ph: {address.phone}</p>
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant italic">No address specified</p>
                )}
              </div>
            </div>
          </Card>

          {/* Payment Summary */}
          <Card className="border-none shadow-sm bg-surface-container-lowest">
            <div className="p-6 border-b border-outline-variant">
              <h2 className="text-lg font-bold text-on-surface">Billing Overview</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Subtotal</span>
                <span className="text-on-surface font-bold">
                  ₹{Number(order.subtotal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Estimated Tax</span>
                <span className="text-on-surface font-bold">
                  ₹{Number(order.tax_amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Shipping</span>
                <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest mt-1">
                  Free
                </span>
              </div>
              <div className="pt-4 border-t border-outline-variant flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
                  Grand Total
                </span>
                <span className="text-3xl font-black text-primary">
                  ₹{Number(order.total_amount).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Fulfillment Modal */}
      {showFulfillModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
            onClick={() => setShowFulfillModal(false)}
          />
          <div
            className="relative bg-surface w-full max-w-[500px] min-w-[320px] shadow-2xl rounded-3xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ width: '500px' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 shadow-inner">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Order Fulfillment</h3>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                    Processing Manifest
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFulfillModal(false)}
                className="h-10 w-10 p-0 rounded-xl hover:bg-surface-container"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-8 space-y-8">
              {/* Warehouse Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
                  Dispatch From Hub
                </label>
                <div className="relative">
                  <select
                    className="w-full h-14 px-4 pr-12 rounded-2xl border border-outline bg-surface text-on-surface font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all cursor-pointer hover:border-indigo-500/50 appearance-none"
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                  >
                    <option value="">Select Warehouse Hub</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {w.location}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant pointer-events-none" />
                </div>
              </div>

              {/* Courier & Tracking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
                    Courier Provider
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-14 px-4 pr-12 rounded-2xl border border-outline bg-surface text-on-surface font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all cursor-pointer hover:border-indigo-500/50 appearance-none"
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                    >
                      <option value="">Select Service</option>
                      <option value="Delhivery">Delhivery</option>
                      <option value="BlueDart">BlueDart</option>
                      <option value="Ecom Express">Ecom Express</option>
                      <option value="FedEx">FedEx</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
                    Tracking Number
                  </label>
                  <Input
                    placeholder="AWB / LR Number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="h-14 rounded-2xl font-bold border-outline focus:ring-indigo-500 uppercase"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowFulfillModal(false)}
                  className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest hover:bg-surface-container"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleUpdateStatus('shipped', {
                      trackingId: trackingNumber,
                      courier,
                      warehouseId: selectedWarehouse,
                    })
                  }
                  disabled={isUpdating || !trackingNumber || !courier || !selectedWarehouse}
                  className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                >
                  {isUpdating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Truck className="h-5 w-5 mr-2" />
                      Dispatch Order
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Processing Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
            onClick={() => setShowReturnModal(false)}
          />
          <div className="relative bg-surface w-full max-w-[560px] shadow-2xl rounded-3xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-orange-50 dark:bg-orange-950/20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Process Return</h3>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                    {order.order_number} · Return & Restock
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReturnModal(false)}
                className="h-10 w-10 p-0 rounded-xl hover:bg-surface-container"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Warning Banner */}
              <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-200 dark:border-orange-800">
                <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                  Items will be restocked to the selected warehouse. This action logs an audit trail
                  and cannot be undone.
                </p>
              </div>

              {/* Return Items */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  Items to Return
                </label>
                <div className="space-y-2">
                  {returnItems.map((item, idx) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-outline-variant"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-on-surface text-sm">{item.name}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                          Max: {item.maxQty} units
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setReturnItems((prev) =>
                              prev.map((i, j) =>
                                j === idx ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i
                              )
                            )
                          }
                          className="h-8 w-8 rounded-xl bg-surface-container flex items-center justify-center font-bold hover:bg-surface-container-high transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-black text-on-surface">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            setReturnItems((prev) =>
                              prev.map((i, j) =>
                                j === idx
                                  ? { ...i, quantity: Math.min(i.maxQty, i.quantity + 1) }
                                  : i
                              )
                            )
                          }
                          className="h-8 w-8 rounded-xl bg-surface-container flex items-center justify-center font-bold hover:bg-surface-container-high transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warehouse */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  Restock To Warehouse
                </label>
                <div className="relative">
                  <select
                    className="w-full h-12 px-4 pr-12 rounded-2xl border border-outline bg-surface text-on-surface font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none appearance-none"
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {w.location}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant pointer-events-none" />
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  Return Reason *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Defective product, wrong item shipped, customer request..."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-outline bg-surface text-on-surface font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none text-sm"
                />
              </div>

              {/* Refund Amount */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  Refund Amount (₹) — Optional
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                  <Input
                    type="number"
                    placeholder={`Max: ${order.total_amount}`}
                    value={returnRefundAmount}
                    onChange={(e) => setReturnRefundAmount(e.target.value)}
                    className="h-12 pl-10 rounded-2xl border-outline focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProcessReturn}
                  disabled={isProcessingReturn || !selectedWarehouse || !returnReason.trim()}
                  className="flex-1 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 text-white"
                >
                  {isProcessingReturn ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Confirm Return
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
