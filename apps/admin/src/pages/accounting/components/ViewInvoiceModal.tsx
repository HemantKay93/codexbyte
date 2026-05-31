import { Card, Button } from '@byteevolvr/ui';
import { useQuery } from '@tanstack/react-query';
import { apiClient, CMSService } from '@byteevolvr/api-client';
import { Download, FileText } from 'lucide-react';

export function ViewInvoiceModal({
  invoiceId,
  onClose,
  currencySymbol,
}: {
  invoiceId: string;
  onClose: () => void;
  currencySymbol: string;
}) {
  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const res = await apiClient.get(`/accounting/invoices/${invoiceId}`);
      return res.data?.data || res.data;
    },
  });

  const { data: cmsDataResponse } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => CMSService.getContent('global'),
  });

  const cmsData = Array.isArray(cmsDataResponse) 
    ? cmsDataResponse 
    : (cmsDataResponse as any)?.data || [];

  const invoice = invoiceData;
  const lineItems = invoiceData?.line_items || [];

  const contactSettings = cmsData?.find((s: any) => s.section_key === 'contact')?.content || {};
  const templateSettings = cmsData?.find((s: any) => s.section_key === 'invoice_template')?.content || {};

  const layout = templateSettings.layout || 'classic';
  const primaryColor = templateSettings.primaryColor || '#004ac6';
  const showLogo = templateSettings.showLogo ?? true;
  const showSignatory = templateSettings.showSignatory ?? true;

  const isMinimalist = layout === 'minimalist';
  const isModern = layout === 'modern';

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl p-10 flex flex-col items-center justify-center bg-surface">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
            <p className="text-on-surface-variant font-medium">Loading Invoice Details...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col bg-surface shadow-2xl relative">
        <div className="p-6 border-b border-outline bg-surface sticky top-0 z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-title-lg font-bold text-on-surface">Invoice #{invoice.invoice_number}</h2>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase mt-1 inline-block ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : invoice.status === 'sent'
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-yellow-500/10 text-yellow-500'
                }`}
              >
                {invoice.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-primary hover:text-primary/80 border-primary/20 bg-primary/5"
              onClick={() => {
                const printContents = document.getElementById('invoice-printable-area')?.outerHTML;
                if (!printContents) return;
                
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                
                const pri = iframe.contentWindow;
                if (pri) {
                  pri.document.open();
                  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                    .map((s) => s.outerHTML)
                    .join('\n');
                    
                  pri.document.write(`
                    <html>
                      <head>
                        <title>Print Invoice</title>
                        ${styles}
                        <style>
                          body { background: white !important; color: black !important; padding: 40px; }
                          * { color: black !important; }
                        </style>
                      </head>
                      <body class="bg-white">
                        ${printContents}
                      </body>
                    </html>
                  `);
                  pri.document.close();
                  pri.focus();
                  setTimeout(() => {
                    pri.print();
                    document.body.removeChild(iframe);
                  }, 250);
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" /> Download / Print
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface"
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-surface-container-lowest border border-outline-variant p-8 overflow-y-auto bg-gray-50">
          <div className="invoice-classic-format" id="invoice-printable-area">
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
              .invoice-classic-format {
                font-family: 'Inter', sans-serif;
                color: #1a1a1a;
                line-height: 1.4;
                font-size: 12px;
                background: #fff;
                --primary-color: ${primaryColor};
              }
              .invoice-classic-format .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background: #fff;
                ${isMinimalist ? 'border: none; padding: 40px;' : 'border: 1px solid #eee; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.05);'}
              }
              .invoice-classic-format .header { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 30px; 
                ${isMinimalist ? 'border-bottom: 1px solid #e5e7eb;' : isModern ? `background: var(--primary-color); color: #fff; padding: 20px; border-radius: 10px; margin: -20px -20px 30px -20px;` : `border-bottom: 2px solid var(--primary-color);`}
                padding-bottom: ${isModern ? '20px' : '20px'};
              }
              .invoice-classic-format .company-info h1 { 
                margin: 0; 
                font-size: 28px; 
                color: ${isModern ? '#fff' : 'var(--primary-color)'}; 
                font-weight: 700;
              }
              .invoice-classic-format .company-info p { margin: 4px 0; color: ${isModern ? '#f3f4f6' : '#4b5563'}; }
              
              .invoice-classic-format .invoice-details { text-align: right; }
              .invoice-classic-format .invoice-details h2 { 
                margin: 0 0 10px 0; 
                font-size: 20px; 
                text-transform: uppercase; 
                color: ${isModern ? '#fff' : 'var(--primary-color)'};
                letter-spacing: 1px;
              }
              .invoice-classic-format .detail-row { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 4px; }
              .invoice-classic-format .detail-label { color: ${isModern ? '#e5e7eb' : '#6b7280'}; font-weight: 500; }
              .invoice-classic-format .detail-value { font-weight: 600; color: ${isModern ? '#fff' : '#111827'}; }

              .invoice-classic-format .address-section { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 40px; 
                margin-bottom: 30px; 
              }
              .invoice-classic-format .address-box h3 { 
                font-size: 10px; 
                text-transform: uppercase; 
                letter-spacing: 1px; 
                color: #6b7280; 
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 5px;
                margin-bottom: 10px;
              }
              .invoice-classic-format .address-content p { margin: 2px 0; font-size: 13px; }
              .invoice-classic-format .address-content .name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }

              .invoice-classic-format .items-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 30px; 
              }
              .invoice-classic-format .items-table th { 
                background: ${isMinimalist ? 'transparent' : isModern ? 'var(--primary-color)' : '#f9fafb'}; 
                color: ${isMinimalist ? '#374151' : isModern ? '#fff' : '#374151'}; 
                text-align: left; 
                padding: 12px 10px; 
                border-bottom: ${isMinimalist ? '1px solid #e5e7eb' : 'none'};
                border-top: ${isMinimalist ? '1px solid #e5e7eb' : 'none'};
                font-weight: 600;
                text-transform: uppercase;
                font-size: 11px;
              }
              .invoice-classic-format .items-table td { 
                padding: 12px 10px; 
                border-bottom: 1px solid #f3f4f6;
                vertical-align: top;
              }
              .invoice-classic-format .text-right { text-align: right; }
              .invoice-classic-format .text-center { text-align: center; }

              .invoice-classic-format .summary-section { 
                display: flex; 
                justify-content: flex-end; 
                margin-bottom: 40px;
              }
              .invoice-classic-format .summary-table { width: 300px; }
              .invoice-classic-format .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
              .invoice-classic-format .summary-row.total { 
                border-top: ${isMinimalist ? '1px solid #e5e7eb' : '2px solid var(--primary-color)'}; 
                margin-top: 10px; 
                padding-top: 10px;
                font-size: 16px;
                font-weight: 700;
                color: ${isMinimalist ? '#111827' : 'var(--primary-color)'};
              }

              .invoice-classic-format .footer { 
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
              }
              .invoice-classic-format .terms { max-width: 60%; font-size: 10px; color: #9ca3af; }
              .invoice-classic-format .signature { text-align: center; }
              .invoice-classic-format .sig-line { border-bottom: 1px solid #111827; width: 150px; margin-bottom: 10px; }
              .invoice-classic-format .sig-text { font-weight: 600; font-size: 11px; }

              @media print {
                body { padding: 0 !important; background: white !important; }
                .invoice-classic-format { padding: 0; background: white; }
                .invoice-classic-format .invoice-container { border: none !important; box-shadow: none !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important;}
                .invoice-classic-format .header { ${isModern ? '-webkit-print-color-adjust: exact; print-color-adjust: exact;' : ''} }
                .invoice-classic-format .items-table th { ${isModern ? '-webkit-print-color-adjust: exact; print-color-adjust: exact;' : ''} }
              }
            `}</style>
            
            <div className="invoice-container">
              <div className="header">
                <div className="company-info">
                  <h1>
                    {showLogo && <span style={{ marginRight: '8px' }}>■</span>}
                    {contactSettings?.storeName || 'ByteEvolvr'}
                  </h1>
                  <p>{contactSettings?.email || 'hello@byteevolvr.com'}</p>
                  <p dangerouslySetInnerHTML={{ __html: (contactSettings?.address || '101, Tech Park\nMumbai, Maharashtra 400069').replace(/\n/g, '<br/>') }}></p>
                  <p>GSTIN: {contactSettings?.gstNumber || '19AABCU9603R1ZN'} | PAN: {contactSettings?.panNumber || 'AABCU9603R'}</p>
                </div>
                <div className="invoice-details">
                  <h2>Tax Invoice</h2>
                  <div className="detail-row">
                    <span className="detail-label">Invoice No:</span>
                    <span className="detail-value">{invoice.invoice_number}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{new Date(invoice.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Place of Supply:</span>
                    <span className="detail-value capitalize">{invoice.supply_type || 'Maharashtra (27)'}</span>
                  </div>
                </div>
              </div>

              <div className="address-section">
                <div className="address-box">
                  <h3>Billed To</h3>
                  <div className="address-content">
                    <p className="name">{invoice.customer_name || 'Customer'}</p>
                    {invoice.customer_email && <p>{invoice.customer_email}</p>}
                    {invoice.customer_phone && <p>Phone: {invoice.customer_phone}</p>}
                    {invoice.customer_gst && <p>GSTIN: {invoice.customer_gst}</p>}
                  </div>
                </div>
                <div className="address-box">
                  <h3>Billing Address</h3>
                  <div className="address-content">
                    {invoice.customer_address ? (
                      <p dangerouslySetInnerHTML={{ __html: invoice.customer_address.replace(/\n/g, '<br/>') }}></p>
                    ) : (
                      <p>As per Billed To</p>
                    )}
                  </div>
                </div>
              </div>

              <table className="items-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Description</th>
                    <th className="text-center" style={{ width: '80px' }}>HSN</th>
                    <th className="text-center" style={{ width: '60px' }}>Qty</th>
                    <th className="text-right" style={{ width: '100px' }}>Rate</th>
                    <th className="text-right" style={{ width: '100px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item: any, i: number) => (
                    <tr key={item.id}>
                      <td className="text-center">{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.description}</div>
                      </td>
                      <td className="text-center">{item.hsn_code || '-'}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">{Number(item.unit_price).toFixed(2)}</td>
                      <td className="text-right">{Number(item.quantity * item.unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="summary-section">
                <div className="summary-table">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{currencySymbol}{Number(invoice.subtotal).toFixed(2)}</span>
                  </div>
                  {invoice.supply_type === 'intra-state' ? (
                    <>
                      <div className="summary-row">
                        <span>CGST</span>
                        <span>{currencySymbol}{(Number(invoice.tax_total) / 2).toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span>SGST</span>
                        <span>{currencySymbol}{(Number(invoice.tax_total) / 2).toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="summary-row">
                      <span>IGST</span>
                      <span>{currencySymbol}{Number(invoice.tax_total).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>{currencySymbol}{Number(invoice.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="footer">
                <div className="terms">
                  <p style={{ fontWeight: 700, color: '#4b5563', marginBottom: '4px' }}>Terms & Conditions</p>
                  <p>1. Goods once sold will not be taken back or exchanged.</p>
                  <p>2. Any dispute subject to company Jurisdiction.</p>
                  <p>3. This is a computer generated invoice and requires no physical signature.</p>
                </div>
                {showSignatory && (
                  <div className="signature">
                    <div className="sig-line"></div>
                    <p className="sig-text">Authorized Signatory</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
