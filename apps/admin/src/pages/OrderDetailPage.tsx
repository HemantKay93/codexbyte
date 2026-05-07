import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Input } from '../components/ui';
import { ArrowLeft, Printer, Package, Truck, CheckCircle2, Loader2, Save, RefreshCcw, ExternalLink } from 'lucide-react';
import { useAdmin } from '../modules/admin/hooks/useAdmin';
import { numberToWords } from '../lib/utils';

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchOrderDetail, updateOrderStatus, isUpdating, isLoading: hookLoading } = useAdmin();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courier, setCourier] = useState('');
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');

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
        <Button onClick={() => navigate('/orders')} className="mt-4">Back to Orders</Button>
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
          <Button variant="ghost" size="sm" onClick={() => navigate('/orders')} className="rounded-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase italic">{order.order_number}</h1>
              <Badge variant={order.payment_status === 'paid' || order.payment_status === 'captured' ? 'success' : 'warning'}>
                {order.payment_status === 'paid' || order.payment_status === 'captured' ? 'PAID' : 'PENDING'}
              </Badge>
            </div>
            <p className="text-sm text-on-surface-variant font-medium">Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              const cgst = Number(order.tax_amount) / 2;
              const sgst = Number(order.tax_amount) / 2;
              const totalInWords = numberToWords(Math.floor(Number(order.total_amount)));
              const items = order.order_items || [];
              const address = order.addresses?.[0] || order.addresses;
              
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
                        <p><strong>${order.customer_name || 'Customer'}</strong></p>
                        <p>${order.customer_email || ''}</p>
                        <p>GSTIN: N/A</p>
                        <p>POS: Maharashtra</p>
                      </div>
                      <div class="address-box">
                        ${address ? `
                          <p><strong>${address.full_name}</strong></p>
                          <p>${address.line_1}</p>
                          ${address.line_2 ? `<p>${address.line_2}</p>` : ''}
                          <p>${address.city}, ${address.state} - ${address.postal_code}</p>
                          <p>Mobile: ${address.phone}</p>
                        ` : '<p>Address not available</p>'}
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
                        ${items.map((item: any, i: number) => `
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
                        `).join('')}
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
                          <tr><td>Sub Total</td><td class="text-right">${Number(order.subtotal).toFixed(2)}</td></tr>
                          <tr><td>CGST 9% on ${Number(order.subtotal).toFixed(2)}</td><td class="text-right">${cgst.toFixed(2)}</td></tr>
                          <tr><td>SGST 9% on ${Number(order.subtotal).toFixed(2)}</td><td class="text-right">${sgst.toFixed(2)}</td></tr>
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
                  </body>
                </html>
              `;
              printWindow.document.write(invoiceHtml);
              printWindow.document.close();
              printWindow.onload = function() {
                setTimeout(() => {
                  printWindow.print();
                }, 500);
              };
            }
          }}>
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
          
          {order.status === 'pending' && (
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => handleUpdateStatus('processing')} disabled={isUpdating}>
              <CheckCircle2 className="h-4 w-4" />
              Accept Order
            </Button>
          )}
          
          {order.status === 'processing' && (
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowFulfillModal(true)} disabled={isUpdating}>
              <Package className="h-4 w-4" />
              Fulfill Order
            </Button>
          )}

          {['shipped', 'processing'].includes(order.status) && (
            <Button variant="outline" className="gap-2 text-blue-600 border-blue-200" onClick={() => handleUpdateStatus('delivered')} disabled={isUpdating}>
              <CheckCircle2 className="h-4 w-4" />
              Mark Delivered
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
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">Product</TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">Price</TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">Qty</TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-surface-container rounded-xl flex items-center justify-center border border-outline-variant">
                            <Package className="h-6 w-6 text-on-surface-variant opacity-30" />
                          </div>
                          <div>
                            <div className="font-bold text-on-surface">{item.product_name}</div>
                            <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">SKU: {item.sku}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">₹{Number(item.unit_price).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className="bg-surface-container px-2 py-1 rounded text-xs font-bold">{item.quantity}</span>
                      </TableCell>
                      <TableCell className="text-right font-black text-primary">₹{Number(item.total_price).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Fulfillment Status Timeline */}
          <Card className="border-none shadow-sm">
            <div className="p-6 border-b border-outline-variant">
              <h2 className="text-lg font-bold text-on-surface">Logistics & Timeline</h2>
            </div>
            <CardContent className="p-8">
              <div className="relative space-y-12">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-outline-variant"></div>
                
                {/* Order Placed */}
                <div className="relative flex gap-6">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 z-10 shadow-lg shadow-blue-200">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Order Placed</p>
                    <p className="text-sm text-on-surface-variant">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Shipped */}
                <div className="relative flex gap-6">
                  <div className={`h-8 w-8 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-indigo-600 text-white' : 'bg-surface-container text-on-surface-variant'} flex items-center justify-center shrink-0 z-10`}>
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface">Dispatched</p>
                    {shipment?.tracking_id ? (
                      <div className="mt-2 p-4 rounded-2xl bg-surface-container-low border border-outline-variant">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Tracking Details</span>
                          <Badge variant="info">{shipment.courier_name}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-lg text-primary">{shipment.tracking_id}</span>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-on-surface-variant">Awaiting fulfillment.</p>
                    )}
                  </div>
                </div>

                {/* Delivered */}
                <div className="relative flex gap-6">
                  <div className={`h-8 w-8 rounded-full ${order.status === 'delivered' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-surface-container text-on-surface-variant'} flex items-center justify-center shrink-0 z-10`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Delivered</p>
                    {order.delivered_at ? (
                      <p className="text-sm text-on-surface-variant">{new Date(order.delivered_at).toLocaleString()}</p>
                    ) : (
                      <p className="text-sm text-on-surface-variant">Pending arrival.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
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
                  <div className="font-bold text-on-surface text-lg">{order.customer_name || 'Guest User'}</div>
                  <div className="text-sm text-on-surface-variant">{order.customer_email || 'No email provided'}</div>
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant">
                <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Shipping Destination</h4>
                {address ? (
                  <div className="text-sm space-y-1">
                    <p className="font-bold text-on-surface">{address.full_name}</p>
                    <p className="text-on-surface-variant">{address.line_1}</p>
                    {address.line_2 && <p className="text-on-surface-variant">{address.line_2}</p>}
                    <p className="text-on-surface-variant">{address.city}, {address.state} - {address.postal_code}</p>
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
                <span className="text-on-surface font-bold">₹{Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Estimated Tax</span>
                <span className="text-on-surface font-bold">₹{Number(order.tax_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Shipping</span>
                <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest mt-1">Free</span>
              </div>
              <div className="pt-4 border-t border-outline-variant flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Grand Total</span>
                <span className="text-3xl font-black text-primary">₹{Number(order.total_amount).toLocaleString()}</span>
              </div>
              
              <div className="mt-6 p-4 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Method</p>
                  <p className="text-sm font-bold uppercase">{order.payment_method}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Status</p>
                  <p className={`text-sm font-bold uppercase ${order.payment_status === 'captured' ? 'text-green-600' : 'text-amber-600'}`}>
                    {order.payment_status}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fulfillment Modal */}
      {showFulfillModal && (
        <div className="fixed inset-0 bg-[#00144a]/60 backdrop-blur-xl flex items-center justify-center z-[9999] p-4">
          <div className="bg-white shadow-2xl rounded-[32px] w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="p-10">
              <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8">
                <Package className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Initialize Fulfillment</h3>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">Enter logistics provider and tracking ID to notify the customer about shipment.</p>
              
              <div className="space-y-6 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Courier Service</label>
                  <select 
                    className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                  >
                    <option value="">Select Provider</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="BlueDart">BlueDart</option>
                    <option value="Ecom Express">Ecom Express</option>
                    <option value="FedEx">FedEx</option>
                    <option value="Custom">Other Service</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AWB / Tracking Number</label>
                  <Input 
                    placeholder="Enter tracking ID" 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="h-14 px-6 rounded-2xl text-lg font-mono font-bold"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setShowFulfillModal(false)} className="flex-1 h-14 rounded-2xl font-bold">
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleUpdateStatus('shipped', { trackingId: trackingNumber, courier })} 
                  disabled={isUpdating || !trackingNumber || !courier}
                  className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black uppercase tracking-widest text-xs"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Truck className="h-4 w-4 mr-2" />}
                  Confirm Shipment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
