import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  Printer,
  Package,
  Truck,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  ExternalLink,
  X,
  ChevronDown,
  RotateCcw,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import { AdminService } from '@byteevolvr/api-client';

import { useAdmin } from '../modules/admin/hooks/useAdmin';
import { OrderActivityLogs } from '../components/OrderActivityLogs';
import { numberToWords } from '../lib/utils';

export function OrderDetailPage() {
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
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courier, setCourier] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnRefundAmount, setReturnRefundAmount] = useState('');
  const [returnItems, setReturnItems] = useState<{ productId: string; quantity: number; maxQty: number; name: string }[]>([]);
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);


  const loadData = async () => {
    if (!id) return;
    setLoading(true);
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
    loadData();
  }, [id]);

  const handleUpdateStatus = async (status: string, extra: any = {}) => {
    if (!id) return;
    try {
      await updateOrderStatus(id, { status, ...extra });
      await loadData();
      setShowFulfillModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openReturnModal = () => {
    const items = order?.order_items || [];
    setReturnItems(
      items.map((item: any) => ({
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
    } catch (err: any) {
      console.error('Return processing failed:', err);
      alert(err?.response?.data?.message || 'Failed to process return.');
    } finally {
      setIsProcessingReturn(false);
    }
  };


  const handlePrint = () => {
    if (!order) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const items = order.order_items || [];
    const address = order.addresses?.[0] || order.addresses;
    const totalInWords = order.total_amount
      ? numberToWords(Math.floor(Number(order.total_amount)))
      : '';
    const cgst = (Number(order.tax_amount) || 0) / 2;
    const sgst = (Number(order.tax_amount) || 0) / 2;

    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${order.order_number}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #1a1a1a; line-height: 1.4; font-size: 11px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .company-info h1 { margin: 0; font-size: 20px; color: #000; }
            .company-info p { margin: 2px 0; color: #333; }
            .tax-invoice-box { background: #3b82f6; color: white; padding: 10px 20px; border-radius: 4px; min-width: 250px; }
            .tax-invoice-box h2 { margin: 0; font-size: 18px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; margin-bottom: 5px; }
            .tax-invoice-box table { width: 100%; border-collapse: collapse; }
            .tax-invoice-box td { color: white; border: none; padding: 2px 0; }
            .address-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #ddd; margin-bottom: 0; }
            .address-box { padding: 10px; border-right: 1px solid #ddd; }
            .address-box:last-child { border-right: none; }
            .section-title { font-weight: bold; background: #f3f4f6; padding: 5px 10px; border: 1px solid #ddd; border-bottom: none; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #ddd; }
            .items-table th { background: #3b82f6; color: white; text-align: center; padding: 8px; border: 1px solid #3b82f6; text-transform: uppercase; font-size: 10px; }
            .items-table td { padding: 8px; border: 1px solid #ddd; vertical-align: top; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .footer-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; margin-top: 0; border: 1px solid #ddd; border-top: none; }
            .amount-words { padding: 15px; border-right: 1px solid #ddd; }
            .totals-table { width: 100%; border-collapse: collapse; }
            .totals-table td { padding: 5px 10px; border-bottom: 1px solid #eee; }
            .total-bar { background: #3b82f6; color: white; font-weight: bold; font-size: 14px; }
            .total-bar td { color: white; border: none; padding: 10px; }
            .terms { padding: 15px; font-size: 9px; color: #666; border-top: 1px solid #ddd; margin-top: 20px; }
            .signature { text-align: right; padding: 20px; margin-top: 20px; }
            .signature-line { border-top: 1px solid #000; width: 200px; display: inline-block; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <h1>ByteEvolvr</h1>
              <p>101, Tech Park, Andheri East<br/>Mumbai, MH 400069<br/>Phone: +91 99999 88888<br/>Email: sales@byteevolvr.in<br/>GSTIN: 27AABCB1234F1Z5</p>
            </div>
            <div class="tax-invoice-box">
              <h2>Tax Invoice</h2>
              <table>
                <tr><td>Invoice Number</td><td class="text-right">: <strong>${order.order_number}</strong></td></tr>
                <tr><td>Invoice Date</td><td class="text-right">: ${new Date(order.created_at).toLocaleDateString()}</td></tr>
                <tr><td>Print Date</td><td class="text-right">: ${new Date().toLocaleDateString()}</td></tr>
              </table>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0;">
            <div class="section-title">Billed To</div>
            <div class="section-title" style="border-left: none;">Billing & Shipping Address</div>
          </div>
          <div class="address-grid">
            <div class="address-box">
              <p><strong>${order.customer_name || 'Walk-in Customer'}</strong></p>
              <p>${order.customer_email || ''}</p>
              <p>GSTIN: N/A</p>
              <p>POS: Maharashtra</p>
            </div>
            <div class="address-box">
              ${
                address
                  ? `
                <p><strong>${address.full_name}</strong></p>
                <p>${address.line_1}</p>
                ${address.line_2 ? `<p>${address.line_2}</p>` : ''}
                <p>${address.city}, ${address.state} - ${address.postal_code}</p>
                <p>Mobile: ${address.phone}</p>
              `
                  : `<p>${order.customer_name || 'Walk-in Customer'}</p><p>Counter Sale</p>`
              }
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 40px;">S.No</th>
                <th>Item Description</th>
                <th style="width: 60px;">Qty</th>
                <th style="width: 80px;">Rate (INR)</th>
                <th style="width: 80px;">Tax (%)</th>
                <th style="width: 100px;">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item: any, i: number) => `
                <tr>
                  <td class="text-center">${i + 1}</td>
                  <td>
                    <strong>${item.product_name}</strong><br/>
                    <small style="color: #666">SKU: ${item.sku}</small>
                  </td>
                  <td class="text-center">${item.quantity} Nos</td>
                  <td class="text-right">${Number(item.unit_price).toFixed(2)}</td>
                  <td class="text-center">18%</td>
                  <td class="text-right">${Number(item.total_price).toFixed(2)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="footer-grid">
            <div class="amount-words">
              <p style="font-weight: bold; margin-bottom: 5px;">Amount in words:</p>
              <p>${totalInWords} Rupees Only</p>
              <p style="margin-top: 20px;">Thanks for your Business!</p>
            </div>
            <div>
              <table class="totals-table">
                <tr><td>Sub Total</td><td class="text-right">${Number(order.subtotal || order.total_amount * 0.82).toFixed(2)}</td></tr>
                <tr><td>CGST 9%</td><td class="text-right">${cgst.toFixed(2)}</td></tr>
                <tr><td>SGST 9%</td><td class="text-right">${sgst.toFixed(2)}</td></tr>
                <tr><td>Round Off</td><td class="text-right">0.00</td></tr>
                <tr class="total-bar"><td>Total</td><td class="text-right">Rs ${Number(order.total_amount).toFixed(2)}</td></tr>
              </table>
            </div>
          </div>
          
          <div class="terms">
            <strong>Terms & Conditions:</strong><br/>
            1. Goods once sold will not be taken back or exchanged.<br/>
            2. Any dispute subject to Mumbai Jurisdiction.<br/>
            3. This is a computer generated invoice and requires no physical signature.
          </div>
          
          <div class="signature">
            <p>for <strong>ByteEvolvr</strong></p>
            <div class="signature-line"></div>
            <p>Authorized Signature</p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 8px; margin-top: 20px;">
            This is a computer generated document
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
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
  const shipment = order.shipments?.[0] || order.shipments;

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

          {order.status === 'pending' && (
            <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => handleUpdateStatus('confirmed')}
              disabled={isUpdating}
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm Order
            </Button>
          )}

          {['pending', 'confirmed'].includes(order.status) && (
            <Button
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setShowFulfillModal(true)}
              disabled={isUpdating}
            >
              <Package className="h-4 w-4" />
              Fulfill Order
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
              className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
              onClick={openReturnModal}
              disabled={isUpdating}
            >
              <RotateCcw className="h-4 w-4" />
              Process Return
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Card */}
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h2 className="text-lg font-bold text-on-surface">Order Items ({items.length})</h2>
              <Package className="h-5 w-5 text-on-surface-variant" />
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container-lowest">
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                      Product
                    </TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">
                      Price
                    </TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">
                      Qty
                    </TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: any) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-surface-container-lowest transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-surface-container rounded-xl flex items-center justify-center border border-outline-variant">
                            <Package className="h-6 w-6 text-on-surface-variant opacity-30" />
                          </div>
                          <div>
                            <div className="font-bold text-on-surface">{item.product_name}</div>
                            <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                              SKU: {item.sku}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{Number(item.unit_price).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="bg-surface-container px-2 py-1 rounded text-xs font-bold">
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-black text-primary">
                        ₹{Number(item.total_price).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Activity Logs Timeline */}
          <Card className="border-none shadow-sm">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-lg font-bold text-on-surface">Order Timeline</h2>
              <RefreshCcw
                className="h-4 w-4 text-on-surface-variant cursor-pointer"
                onClick={() => loadData()}
              />
            </div>
            <CardContent className="p-8">
              <OrderActivityLogs orderId={id!} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar (same as before) */}
        <div className="space-y-6">
          {/* Customer Card */}
          <Card className="border-none shadow-sm">
            <div className="p-6 border-b border-outline-variant">
              <h2 className="text-lg font-bold text-on-surface">Customer Detail</h2>
            </div>
            <CardContent className="p-6 space-y-6">
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
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="border-none shadow-sm bg-surface-container-lowest">
            <div className="p-6 border-b border-outline-variant">
              <h2 className="text-lg font-bold text-on-surface">Billing Overview</h2>
            </div>
            <CardContent className="p-6 space-y-4">
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
            </CardContent>
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
              <div className="grid grid-cols-2 gap-6">
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
          <div
            className="relative bg-surface w-full max-w-[560px] shadow-2xl rounded-3xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
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
                  Items will be restocked to the selected warehouse. This action logs an audit trail and cannot be undone.
                </p>
              </div>

              {/* Return Items */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  Items to Return
                </label>
                <div className="space-y-2">
                  {returnItems.map((item, idx) => (
                    <div key={item.productId} className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-outline-variant">
                      <div className="flex-1">
                        <p className="font-bold text-on-surface text-sm">{item.name}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Max: {item.maxQty} units</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReturnItems(prev => prev.map((i, j) => j === idx ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i))}
                          className="h-8 w-8 rounded-xl bg-surface-container flex items-center justify-center font-bold hover:bg-surface-container-high transition-colors"
                        >−</button>
                        <span className="w-8 text-center font-black text-on-surface">{item.quantity}</span>
                        <button
                          onClick={() => setReturnItems(prev => prev.map((i, j) => j === idx ? { ...i, quantity: Math.min(i.maxQty, i.quantity + 1) } : i))}
                          className="h-8 w-8 rounded-xl bg-surface-container flex items-center justify-center font-bold hover:bg-surface-container-high transition-colors"
                        >+</button>
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
                      <option key={w.id} value={w.id}>{w.name} — {w.location}</option>
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
                    <><RotateCcw className="h-4 w-4 mr-2" />Confirm Return</>
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
