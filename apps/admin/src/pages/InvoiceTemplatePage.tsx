import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@byteevolvr/ui';
import { Save, Palette, LayoutTemplate, Loader2, Link as LinkIcon } from 'lucide-react';
import { CMSService } from '@byteevolvr/api-client';
import { Link } from 'react-router-dom';

export function InvoiceTemplatePage() {
  // eslint-disable-line complexity
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings from CMS 'contact' (Read Only)
  const [contactSettings, setContactSettings] = useState<any>({});
  // eslint-disable-line @typescript-eslint/no-explicit-any

  // Template settings state
  const [layout, setLayout] = useState('classic');
  const [primaryColor, setPrimaryColor] = useState('#004ac6');
  const [showLogo, setShowLogo] = useState(true);
  const [showSignatory, setShowSignatory] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const cmsData = await CMSService.getContent('global');
        const contact = cmsData?.find((s: any) => s.section_key === 'contact')?.content || {};
        // eslint-disable-line @typescript-eslint/no-explicit-any
        const template =
          cmsData?.find((s: any) => s.section_key === 'invoice_template')?.content || {};
        // eslint-disable-line @typescript-eslint/no-explicit-any

        setContactSettings(contact);
        if (template.layout) setLayout(template.layout);
        if (template.primaryColor) setPrimaryColor(template.primaryColor);
        if (template.showLogo !== undefined) setShowLogo(template.showLogo);
        if (template.showSignatory !== undefined) setShowSignatory(template.showSignatory);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
    // eslint-disable-line @typescript-eslint/no-floating-promises
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await CMSService.updateContent('global', 'invoice_template', {
        layout,
        primaryColor,
        showLogo,
        showSignatory,
      });
      alert('Template saved successfully!');
    } catch (err) {
      console.error('Failed to save', err);
      alert('Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Derived styles based on layout
  const isMinimalist = layout === 'minimalist';
  const isModern = layout === 'modern';

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">
            B2B GST Invoice Template
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Design and configure standard tax invoices
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSave} className="gap-2" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Template
          </Button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-80 shrink-0 overflow-y-auto space-y-4">
          <Card>
            <div className="p-4 border-b border-outline-variant flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2Icon />
                <h3 className="font-semibold text-on-surface">Company Details</h3>
              </div>
              <Link to="/settings" className="text-primary hover:underline">
                <LinkIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-xs text-on-surface-variant mb-2">
                These details are synced from your main Store Settings.
              </p>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Company Name
                </label>
                <Input
                  value={contactSettings.storeName || ''}
                  disabled
                  className="opacity-70 bg-surface-container"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  GSTIN
                </label>
                <Input
                  value={contactSettings.gstNumber || ''}
                  disabled
                  className="opacity-70 bg-surface-container"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  PAN
                </label>
                <Input
                  value={contactSettings.panNumber || ''}
                  disabled
                  className="opacity-70 bg-surface-container"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Registered Address
                </label>
                <textarea
                  className="w-full bg-surface-container border border-outline rounded p-2 text-sm opacity-70"
                  rows={3}
                  value={contactSettings.address || ''}
                  disabled
                />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4 border-b border-outline-variant flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4 text-on-surface-variant" />
              <h3 className="font-semibold text-on-surface">Template Style</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Select Layout
                </label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  value={layout}
                  onChange={(e) => setLayout(e.target.value)}
                >
                  <option value="classic">Classic (Default)</option>
                  <option value="modern">Modern Professional</option>
                  <option value="minimalist">Minimalist Clean</option>
                </select>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4 border-b border-outline-variant flex items-center gap-2">
              <Palette className="h-4 w-4 text-on-surface-variant" />
              <h3 className="font-semibold text-on-surface">Styling</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-8 w-12 rounded cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface">Show Logo</span>
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface">
                  Show Authorized Signatory
                </span>
                <input
                  type="checkbox"
                  checked={showSignatory}
                  onChange={(e) => setShowSignatory(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Live Preview Pane */}
        <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-white border border-outline shadow-sm p-10 min-h-[800px] text-black">
            {/* Mock Invoice Visual */}
            <div
              className={`flex justify-between items-start mb-6 ${isMinimalist ? 'pb-4 border-b border-gray-200' : isModern ? 'p-6 rounded-xl' : 'pb-6 border-b-2'}`}
              style={{
                borderColor: isMinimalist ? undefined : primaryColor,
                backgroundColor: isModern ? `${primaryColor}10` : 'transparent',
              }}
            >
              <div>
                <div className="text-2xl font-bold mb-1" style={{ color: primaryColor }}>
                  {showLogo && <span className="mr-2">■</span>}
                  {contactSettings.storeName || 'ByteEvolvr'}
                </div>
                <div className="text-xs text-gray-600">
                  {contactSettings.email || 'hello@byteevolvr.com'}
                  <br />
                  {(contactSettings.address || '101, Tech Park\nMumbai, Maharashtra 400069')
                    .split('\n')
                    .map((line: string, i: number) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  GSTIN: {contactSettings.gstNumber || '27AABCU9603R1ZN'}
                </div>
              </div>
              <div className="text-right">
                <h2
                  className="text-xl font-bold mb-2 uppercase tracking-widest"
                  style={{ color: primaryColor }}
                >
                  Tax Invoice
                </h2>
                <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                  <span>Invoice No:</span>{' '}
                  <span className="font-semibold text-black">INV-2026-0042</span>
                  <span>Date:</span> <span className="font-semibold text-black">02-May-2026</span>
                  <span>Place of Supply:</span>{' '}
                  <span className="font-semibold text-black">Maharashtra (27)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 border-b border-gray-200 pb-1">
                  Billed To
                </h4>
                <div className="text-sm">
                  <p className="font-bold text-black">Acme Corp Ltd</p>
                  <p className="text-gray-600">
                    55 Business Road, Sector 4<br />
                    Pune, Maharashtra 411001
                  </p>
                  <p className="text-gray-600 mt-1">GSTIN: 27XYZABC1234F1Z5</p>
                </div>
              </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm mb-8">
                <thead>
                  <tr
                    style={{
                      backgroundColor: isModern
                        ? `${primaryColor}20`
                        : isMinimalist
                          ? 'transparent'
                          : `${primaryColor}10`,
                      borderTop: isMinimalist ? '1px solid #e5e7eb' : 'none',
                      borderBottom: isMinimalist
                        ? '1px solid #e5e7eb'
                        : `1px solid ${primaryColor}40`,
                    }}
                  >
                    <th className="text-left py-2 px-2 font-semibold text-black">Description</th>
                    <th className="text-center py-2 px-2 font-semibold text-black">HSN/SAC</th>
                    <th className="text-right py-2 px-2 font-semibold text-black">Qty</th>
                    <th className="text-right py-2 px-2 font-semibold text-black">Rate</th>
                    <th className="text-right py-2 px-2 font-semibold text-black">Taxable Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 text-gray-700">
                    <td className="py-3 px-2">Premium Wireless Headphones</td>
                    <td className="text-center py-3 px-2">8518</td>
                    <td className="text-right py-3 px-2">10</td>
                    <td className="text-right py-3 px-2">₹25,000.00</td>
                    <td className="text-right py-3 px-2">₹2,50,000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-10">
              <div className="w-1/2">
                <div className="w-full overflow-x-auto custom-scrollbar">
                  <table className="w-full text-sm">
                    <tbody className="text-gray-700">
                      <tr>
                        <td className="py-1">Total Taxable Value</td>
                        <td className="py-1 text-right font-medium text-black">₹2,50,000.00</td>
                      </tr>
                      <tr>
                        <td className="py-1">CGST @ 9%</td>
                        <td className="py-1 text-right text-black">₹22,500.00</td>
                      </tr>
                      <tr>
                        <td className="py-1">SGST @ 9%</td>
                        <td className="py-1 text-right text-black">₹22,500.00</td>
                      </tr>
                      <tr
                        className="font-bold text-lg"
                        style={{
                          borderTop: isMinimalist
                            ? '1px solid #e5e7eb'
                            : `2px solid ${primaryColor}`,
                          color: primaryColor,
                        }}
                      >
                        <td className="py-2 pt-4">Invoice Total</td>
                        <td className="py-2 pt-4 text-right">₹2,95,000.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-auto border-t border-gray-200 pt-4 flex justify-between items-end">
              <div className="text-xs text-gray-500">
                <p className="font-bold mb-1 text-gray-600">Terms & Conditions:</p>
                <p>1. Goods once sold will not be taken back.</p>
                <p>2. Subject to Mumbai jurisdiction.</p>
              </div>
              {showSignatory && (
                <div className="text-center w-48">
                  <div className="h-12 border-b border-gray-400 mb-2"></div>
                  <p className="text-xs font-medium text-gray-700">Authorized Signatory</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Building2Icon(props: any) {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-building-2 h-4 w-4 text-on-surface-variant"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
