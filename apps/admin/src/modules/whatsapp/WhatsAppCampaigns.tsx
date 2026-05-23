import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../components/ui';
import { toast } from 'sonner';
import { apiClient } from '@byteevolvr/api-client';
import * as XLSX from 'xlsx';
import { UploadCloud, MessageSquare, List } from 'lucide-react';

export const WhatsAppCampaigns = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [bulkManualNumbers, setBulkManualNumbers] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');

  const updateManualPreview = (nums: string, msg: string) => {
    if (!nums.trim() || !msg.trim()) {
      setBulkPreview([]);
      return;
    }
    
    const numbersList = nums.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
    const mapped = numbersList.map(n => ({
      to: n,
      message: msg
    }));
    setBulkPreview(mapped);
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !message) return toast.error('Phone and message required');
    
    try {
      setLoading(true);
      const res = await apiClient.post('/whatsapp/test-message', { to, message });
      if (res.data) {
        toast.success('Test message queued successfully!');
        setTo('');
        setMessage('');
      }
    } catch (err) {
      toast.error('Failed to queue message');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const mapped = data.map((row: any) => {
        // Try to find columns for phone and message flexibly
        const phoneKey = Object.keys(row).find(k => k.toLowerCase().includes('phone') || k.toLowerCase().includes('number') || k.toLowerCase().includes('to'));
        const msgKey = Object.keys(row).find(k => k.toLowerCase().includes('message') || k.toLowerCase().includes('content'));
        
        return {
          to: phoneKey ? row[phoneKey].toString() : '',
          message: msgKey ? row[msgKey] : ''
        };
      }).filter(r => r.to && r.message);

      setBulkPreview(mapped);
      if (mapped.length === 0) {
        toast.error('Could not find Phone and Message columns in the file.');
      } else {
        toast.success(`Found ${mapped.length} valid entries.`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSendBulk = async () => {
    if (bulkPreview.length === 0) return toast.error('No valid messages found to send');
    
    try {
      setLoading(true);
      const res = await apiClient.post('/whatsapp/bulk-campaign', { messages: bulkPreview });
      if (res.data) {
        toast.success(`Successfully queued ${bulkPreview.length} messages for delivery!`);
        setBulkFile(null);
        setBulkPreview([]);
        setBulkManualNumbers('');
        setBulkMessage('');
      }
    } catch (err) {
      toast.error('Failed to queue bulk campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">WhatsApp Campaigns & Testing</h1>

      <div className="flex gap-4 border-b border-outline-variant pb-2">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'single' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Single Message
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'bulk' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <List className="w-4 h-4" /> Bulk Excel Campaign
        </button>
      </div>

      <Card className="bg-card max-w-2xl">
        {activeTab === 'single' ? (
          <>
            <CardHeader>
              <CardTitle>Send Manual Test Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendTest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number (with country code)</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-white"
                    placeholder="e.g. 1234567890"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Message Content</label>
                  <textarea
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-white h-32"
                    placeholder="Hello from ByteEvolvr..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Queueing...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Upload Bulk List (Excel/CSV)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center hover:bg-surface-container transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept=".xlsx, .xls, .csv" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 mx-auto text-primary mb-3" />
                  <h3 className="text-sm font-medium text-on-surface mb-1">
                    {bulkFile ? bulkFile.name : 'Click or drag Excel/CSV file here'}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-2">
                    Or paste numbers below
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-outline-variant">
                  <h3 className="text-sm font-medium text-on-surface mb-2">Manual Input</h3>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Comma or line separated numbers</label>
                    <textarea 
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-white h-24"
                      placeholder="e.g. 1234567890, 0987654321&#10;1122334455"
                      value={bulkManualNumbers}
                      onChange={(e) => {
                        setBulkManualNumbers(e.target.value);
                        updateManualPreview(e.target.value, bulkMessage);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Message Content for Manual Numbers</label>
                    <textarea 
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-white h-24"
                      placeholder="Your promotional message here..."
                      value={bulkMessage}
                      onChange={(e) => {
                        setBulkMessage(e.target.value);
                        updateManualPreview(bulkManualNumbers, e.target.value);
                      }}
                    />
                  </div>
                </div>

                {bulkPreview.length > 0 && (
                  <div className="bg-surface-container rounded-lg p-4 max-h-64 overflow-y-auto">
                    <h4 className="text-sm font-semibold mb-3 flex items-center justify-between">
                      Preview ({bulkPreview.length} items)
                    </h4>
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-on-surface-variant">
                          <th className="pb-2">Phone</th>
                          <th className="pb-2">Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {bulkPreview.slice(0, 50).map((row, i) => (
                          <tr key={i}>
                            <td className="py-2 text-on-surface">{row.to}</td>
                            <td className="py-2 text-on-surface-variant max-w-[200px] truncate" title={row.message}>{row.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {bulkPreview.length > 50 && (
                      <p className="text-center text-xs text-on-surface-variant mt-2 pt-2 border-t border-outline-variant">
                        ... and {bulkPreview.length - 50} more
                      </p>
                    )}
                  </div>
                )}

                <Button 
                  onClick={handleSendBulk} 
                  disabled={loading || bulkPreview.length === 0} 
                  className="w-full"
                >
                  {loading ? 'Queueing Campaign...' : `Launch Bulk Campaign (${bulkPreview.length} messages)`}
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};
