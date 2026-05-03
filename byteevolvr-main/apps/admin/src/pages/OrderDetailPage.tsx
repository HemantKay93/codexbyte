import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Input } from '../components/ui';
import { ArrowLeft, Printer, Package, Truck, CheckCircle2, Copy, Loader2, Save, RefreshCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { numberToWords } from '../lib/utils';

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  async function fetchOrderDetails() {
    setLoading(true);
    try {
      // Fetch order and customer
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          customer:user_profiles!user_id (
            full_name,
            email
          ),
          shipping_address:addresses!shipping_address_id (*)
        `)
        .eq('id', id)
        .single();

      if (orderError) {
        console.warn('Join failed, fetching order only:', orderError);
        const { data: simpleOrder, error: simpleError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
        
        if (simpleError) throw simpleError;
        setOrder(simpleOrder);
      } else {
        setOrder(orderData);
      }
      setTrackingNumber(orderData?.tracking_number || '');

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (err) {
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateReturn = async () => {
    if (!returnReason) {
      alert('Please provide a reason for the return');
      return;
    }
    setIsUpdating(true);
    try {
      const rmaNumber = `RMA-${Math.floor(1000 + Math.random() * 9000)}`;
      const { error } = await supabase
        .from('order_returns')
        .insert({
          order_id: id,
          user_id: order.user_id,
          rma_number: rmaNumber,
          reason: returnReason,
          status: 'pending'
        });

      if (error) throw error;
      
      alert(`Return Request Created: ${rmaNumber}`);
      setShowReturnModal(false);
      navigate('/returns');
    } catch (err) {
      console.error('Error creating return:', err);
      alert('Failed to create return request');
    } finally {
      setIsUpdating(false);
    }
  };

  const [showFulfillModal, setShowFulfillModal] = useState(false);

  const updateOrderStatus = async (newStatus: string, additionalData: any = {}) => {
    setIsUpdating(true);
    try {
      const updateData: any = { 
        status: newStatus,
        ...additionalData
      };

      // Set timestamps based on status
      const now = new Date().toISOString();
      if (newStatus === 'processing' && !order.accepted_at) {
        updateData.accepted_at = now;
      } else if (newStatus === 'shipped') {
        updateData.shipped_at = now;
      } else if (newStatus === 'delivered') {
        updateData.delivered_at = now;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      await fetchOrderDetails();
      alert(`Order status updated to ${newStatus}`);
      setShowFulfillModal(false);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-on-surface-variant">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        Loading order details...
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="px-2" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-display-sm font-semibold text-on-background">{order.order_number}</h1>
            <Badge variant={order.payment_status === 'captured' ? 'success' : 'warning'}>
              {order.payment_status === 'captured' ? 'Paid' : 'Unpaid'}
            </Badge>
            <Badge 
              variant={
                order.status === 'delivered' ? 'success' :
                order.status === 'shipped' ? 'success' :
                order.status === 'processing' ? 'info' :
                order.status === 'cancelled' ? 'error' : 'warning'
              }
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              const cgst = Number(order.tax_amount) / 2;
              const sgst = Number(order.tax_amount) / 2;
              const totalInWords = numberToWords(Math.floor(Number(order.total_amount)));
              
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
                        <p><strong>${order.customer_name || order.customer?.full_name || 'Customer'}</strong></p>
                        <p>${order.customer_email || order.customer?.email || ''}</p>
                        <p>GSTIN: N/A</p>
                        <p>POS: Maharashtra</p>
                      </div>
                      <div class="address-box">
                        ${order.shipping_address ? `
                          <p><strong>${order.shipping_address.full_name}</strong></p>
                          <p>${order.shipping_address.line_1}</p>
                          ${order.shipping_address.line_2 ? `<p>${order.shipping_address.line_2}</p>` : ''}
                          <p>${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.postal_code}</p>
                          <p>Mobile: ${order.shipping_address.phone}</p>
                        ` : '<p>Address not available</p>'}
                        <p>Email: ${order.customer_email || order.customer?.email || ''}</p>
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
                        ${items.map((item, i) => `
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
                    
                    <div style="text-align: center; color: #999; font-size: 8px; margin-top: 20px;">
                      This is a computer generated document
                    </div>
                  </body>
                </html>
              `;
              printWindow.document.write(invoiceHtml);
              printWindow.document.close();
              
              // Ensure images/fonts are loaded before printing
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
            <Button className="gap-2 bg-success hover:bg-success/90" onClick={() => updateOrderStatus('processing')} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Accept Order
            </Button>
          )}
          {order.status === 'processing' && (
            <Button className="gap-2" onClick={() => setShowFulfillModal(true)} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
              Fulfill Order
            </Button>
          )}
          {['shipped', 'delivered'].includes(order.status) && (
            <Button variant="outline" className="gap-2 text-error hover:bg-error/10" onClick={() => setShowReturnModal(true)}>
              <RefreshCcw className="h-4 w-4" />
              Return Order
            </Button>
          )}
        </div>
      </div>

      {showFulfillModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div 
            className="bg-surface shadow-2xl border border-outline-variant rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
            style={{ width: '480px', maxWidth: '100%' }}
          >
            <div className="p-8">
              <h3 className="text-2xl font-bold text-on-surface mb-2">Fulfill Order</h3>
              <p className="text-sm text-on-surface-variant mb-8">Please enter the tracking information to mark this order as shipped and notify the customer.</p>
              
              <div className="space-y-6 mb-10">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Tracking Number</label>
                  <Input 
                    placeholder="Enter tracking number (e.g. SF123456789)" 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full h-12 text-lg"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
                <Button variant="ghost" onClick={() => setShowFulfillModal(false)} className="px-6">
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateOrderStatus('shipped', { tracking_number: trackingNumber })} 
                  disabled={isUpdating || !trackingNumber}
                  className="bg-primary hover:bg-primary/90 px-8 h-11"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Truck className="h-4 w-4 mr-2" />}
                  Confirm & Ship
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div 
            className="bg-surface shadow-2xl border border-outline-variant rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
            style={{ width: '480px', maxWidth: '100%' }}
          >
            <div className="p-8">
              <h3 className="text-2xl font-bold text-on-surface mb-2">Create Return Request</h3>
              <p className="text-sm text-on-surface-variant mb-8">Specify the reason for returning this order to help us process the request faster.</p>
              
              <div className="space-y-6 mb-10">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Return Reason</label>
                  <textarea
                    className="w-full h-40 p-4 rounded-xl border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-base"
                    placeholder="Provide details about the return reason (e.g. Defective, Wrong Item)..."
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
                <Button variant="ghost" onClick={() => setShowReturnModal(false)} className="px-6">
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateReturn} 
                  disabled={isUpdating || !returnReason}
                  className="bg-error hover:bg-error/90 text-white px-8 h-11"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
                  Confirm Return
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-lg font-semibold text-on-surface">Order Items ({items.length})</h2>
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-surface-container rounded flex-shrink-0 flex items-center justify-center">
                            <Package className="h-5 w-5 text-on-surface-variant opacity-50" />
                          </div>
                          <div>
                            <div className="font-medium text-on-surface text-sm">{item.product_name}</div>
                            <div className="text-xs text-on-surface-variant">SKU: {item.sku}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">₹{Number(item.unit_price).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium text-sm">₹{Number(item.total_price).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-lg font-semibold text-on-surface">Shipping & Tracking</h2>
              <Truck className="h-5 w-5 text-on-surface-variant" />
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Tracking Number</label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter tracking number..." 
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      disabled={order.status === 'delivered'}
                    />
                    <Button variant="outline" size="sm" onClick={() => updateOrderStatus(order.status)} disabled={isUpdating}>
                      <Save className="h-4 w-4 mr-2" /> Save
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 space-y-4">
                  <div className="flex gap-4 relative">
                    <div className={`absolute left-4 top-8 bottom-[-24px] w-px ${order.status !== 'pending' ? 'bg-primary' : 'bg-outline-variant'}`}></div>
                    <div className={`h-8 w-8 rounded-full ${order.status !== 'pending' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'} flex items-center justify-center shrink-0 z-10`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">Order Accepted</p>
                      <p className="text-sm text-on-surface-variant">
                        {order.accepted_at ? new Date(order.accepted_at).toLocaleString() : (order.status !== 'pending' ? 'Confirmed' : 'Awaiting acceptance')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 relative">
                    <div className={`absolute left-4 top-8 bottom-[-24px] w-px ${['shipped', 'delivered'].includes(order.status) ? 'bg-primary' : 'bg-outline-variant'}`}></div>
                    <div className={`h-8 w-8 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'} flex items-center justify-center shrink-0 z-10`}>
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-on-surface">Shipped</p>
                      {order.shipped_at ? (
                        <div className="text-sm text-on-surface-variant">
                          <p>{new Date(order.shipped_at).toLocaleString()}</p>
                          <p>Tracking: <span className="font-mono font-bold text-primary">{order.tracking_number}</span></p>
                        </div>
                      ) : (
                        <p className="text-sm text-on-surface-variant">Awaiting shipment information.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className={`h-8 w-8 rounded-full ${order.status === 'delivered' ? 'bg-success text-white' : 'bg-surface-container text-on-surface-variant'} flex items-center justify-center shrink-0 z-10`}>
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">Delivered</p>
                      {order.delivered_at ? (
                        <p className="text-sm text-on-surface-variant">{new Date(order.delivered_at).toLocaleString()}</p>
                      ) : (
                        order.status === 'shipped' ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 text-primary" 
                            onClick={() => updateOrderStatus('delivered')}
                            disabled={isUpdating}
                          >
                            Mark as Delivered
                          </Button>
                        ) : (
                          <p className="text-sm text-on-surface-variant">Pending delivery.</p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Configuration */}
        <div className="space-y-6">
          <Card>
            <div className="p-4 border-b border-outline-variant">
              <h2 className="text-lg font-semibold text-on-surface">Customer</h2>
            </div>
            <CardContent className="p-6">
              <div className="font-medium text-on-surface text-lg">
                {order.customer_name || order.user?.full_name || (order.order_number.startsWith('POS') ? 'Walk-in Customer' : 'Guest Customer')}
              </div>
              <div className="text-sm text-primary hover:underline cursor-pointer mb-4">
                {order.customer_email || order.user?.email || 'No email provided'}
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Order Source</h4>
                  <Badge 
                    variant={order.order_number.startsWith('POS') ? 'warning' : 'info'} 
                    className="w-fit"
                  >
                    {order.order_number.startsWith('POS') ? 'POS Terminal' : 'Online Storefront'}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Payment Details</h4>
                  <div className="text-sm text-on-surface flex items-center gap-2 capitalize bg-surface-container p-3 rounded-lg border border-outline-variant">
                    <span className="font-semibold">{order.payment_method}</span>
                    <span className="text-on-surface-variant text-xs">•</span>
                    <span className={order.payment_status === 'completed' ? 'text-success' : 'text-warning font-medium'}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="p-4 border-b border-outline-variant">
              <h2 className="text-lg font-semibold text-on-surface">Summary</h2>
            </div>
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Subtotal ({items.length} items)</span>
                <span className="text-on-surface">₹{Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Tax (GST)</span>
                <span className="text-on-surface">₹{Number(order.tax_amount).toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-outline-variant flex justify-between font-bold text-xl">
                <span className="text-on-surface">Total</span>
                <span className="text-primary">₹{Number(order.total_amount).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
