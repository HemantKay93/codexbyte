import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@byteevolvr/ui';
import { Package, Truck, Calendar, CreditCard, Printer } from 'lucide-react';

export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchOrders(user.id);
    } else {
      setLoading(false);
    }
  }

  async function fetchOrders(userId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <main style={{ padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 400, margin: '0 auto', background: 'rgba(255,255,255,0.03)', padding: 40, borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>Please Sign In</h2>
          <p style={{ color: '#8B9BB8', marginBottom: 24 }}>You need to be logged in to view your order history.</p>
          <a href="/login" style={{ display: 'inline-block', padding: '12px 32px', background: 'var(--color-primary)', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>Login</a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '48px var(--space-8) 80px' }}>
      <section style={{ maxWidth: 1000, margin: '0 auto' }}>
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 44, fontWeight: 800, marginBottom: 8 }}>Order History</h1>
          <p style={{ color: '#8B9BB8' }}>Track and manage your past and current orders.</p>
        </header>

        <div style={{ display: 'grid', gap: 24 }}>
          {orders.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '2px dashed rgba(255,255,255,0.05)' }}>
              <Package size={48} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
              <p style={{ color: '#8B9BB8' }}>No orders placed yet. Start shopping to see your history!</p>
            </div>
          ) : (
            orders.map((order) => (
              <article
                key={order.id}
                style={{
                  padding: 24,
                  borderRadius: 24,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: '#8B9BB8', fontWeight: 600, textTransform: 'uppercase' }}>Order</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>#{order.order_number}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#8B9BB8', fontSize: 14 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} /> {new Date(order.created_at).toLocaleDateString()}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CreditCard size={14} /> {order.payment_method || 'Razorpay'}</span>
                    </div>
                  </div>
                  <div style={{ 
                    padding: '8px 16px', 
                    borderRadius: 100, 
                    background: order.status === 'delivered' ? 'rgba(16,185,129,0.1)' : 'rgba(96,165,250,0.1)',
                    color: order.status === 'delivered' ? '#10B981' : '#60A5FA',
                    fontSize: 14,
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}>
                    {order.status}
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div style={{ 
                  margin: '20px 0', 
                  padding: '16px', 
                  background: 'rgba(255,255,255,0.02)', 
                  borderRadius: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 12
                }}>
                  <div style={{ flex: 1, textAlign: 'center', opacity: order.accepted_at ? 1 : 0.4 }}>
                    <div style={{ fontWeight: 700, color: order.accepted_at ? '#10B981' : 'inherit', marginBottom: 4 }}>✓ Accepted</div>
                    <div style={{ color: '#8B9BB8' }}>{order.accepted_at ? new Date(order.accepted_at).toLocaleDateString() : '--'}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', opacity: order.shipped_at ? 1 : 0.4 }}>
                    <div style={{ fontWeight: 700, color: order.shipped_at ? '#60A5FA' : 'inherit', marginBottom: 4 }}>📦 Shipped</div>
                    <div style={{ color: '#8B9BB8' }}>{order.shipped_at ? new Date(order.shipped_at).toLocaleDateString() : '--'}</div>
                    {order.tracking_number && <div style={{ marginTop: 4, fontWeight: 700, color: '#fff' }}>ID: {order.tracking_number}</div>}
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', opacity: order.delivered_at ? 1 : 0.4 }}>
                    <div style={{ fontWeight: 700, color: order.delivered_at ? '#F59E0B' : 'inherit', marginBottom: 4 }}>🚚 Delivered</div>
                    <div style={{ color: '#8B9BB8' }}>{order.delivered_at ? new Date(order.delivered_at).toLocaleDateString() : '--'}</div>
                  </div>
                </div>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '20px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div>
                      <div style={{ color: '#8B9BB8', fontSize: 12, marginBottom: 4 }}>Total Amount</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>₹{Number(order.total_amount).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={async () => {
                        try {
                          const { data: items, error: itemsError } = await supabase
                            .from('order_items')
                            .select('*')
                            .eq('order_id', order.id);
                          
                          if (itemsError) throw itemsError;
                          
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
                            
                            printWindow.onload = () => {
                              setTimeout(() => {
                                printWindow.print();
                              }, 500);
                            };
                          }
                        } catch (err) {
                          console.error('Print failed:', err);
                          alert('Could not generate invoice.');
                        }
                      }}
                      style={{ 
                        padding: '10px 20px', 
                        borderRadius: 10, 
                        background: 'rgba(255,255,255,0.05)', 
                        color: '#fff', 
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14, 
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <Printer size={16} /> Print Invoice
                    </button>
                    <a 
                      href={`/track?id=${order.id}`} 
                      style={{ 
                        padding: '10px 20px', 
                        borderRadius: 10, 
                        background: 'rgba(255,255,255,0.05)', 
                        color: '#fff', 
                        textDecoration: 'none', 
                        fontSize: 14, 
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <Truck size={16} /> Track Order
                    </a>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
