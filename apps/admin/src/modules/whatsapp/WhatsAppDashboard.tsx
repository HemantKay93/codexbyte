import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader2, RefreshCw, MessageCircle } from 'lucide-react';
import { apiClient } from '@byteevolvr/api-client';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export const WhatsAppDashboard = () => {
  const [status, setStatus] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      // The apiClient interceptor automatically unwraps { success, data } responses into res.data
      const res = await apiClient.get(`/whatsapp/status?t=${Date.now()}`);
      if (res.data && typeof res.data === 'object') {
        setStatus(res.data);
      }
      
      const logRes = await apiClient.get('/whatsapp/logs?limit=10');
      if (logRes.data && Array.isArray(logRes.data)) {
        setLogs(logRes.data);
      }
    } catch (err: any) {
      console.error('FETCH STATUS ERROR:', err?.response?.data || err.message);
      if (!silent) toast.error('Failed to fetch WhatsApp status');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const restart = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/whatsapp/reconnect');
      if (res.data) {
        toast.success('Restart initiated...');
        setTimeout(() => fetchStatus(false), 3000);
      }
    } catch (err) {
      toast.error('Failed to initiate restart');
    }
  };

  const generateQR = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('This will log you out and require you to scan a new QR code. Continue?')) return;
    try {
      const res = await apiClient.post('/whatsapp/generate-qr');
      if (res.data) {
        toast.success('Generating new QR code...');
        setTimeout(() => fetchStatus(false), 3000);
      }
    } catch (err) {
      toast.error('Failed to generate new QR');
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Auto-refresh every 3 seconds silently to catch QR code and status updates dynamically
    const interval = setInterval(() => {
      fetchStatus(true);
    }, 3000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <MessageCircle className="text-green-500" />
          WhatsApp Integration
        </h1>
        <Button onClick={() => fetchStatus(false)} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin text-primary" /> : (
              <div className="space-y-4">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-semibold ${status?.session?.status === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
                    {(status?.session?.status || 'UNKNOWN').toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Session Name</span>
                  <span>{status?.session?.session_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Last Active</span>
                  <span>{status?.session?.last_active ? new Date(status.session.last_active).toLocaleString() : 'N/A'}</span>
                </div>
                
                {status?.session?.status !== 'connected' && status?.session?.status !== 'qr_ready' && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button onClick={restart} className="w-full">
                      Restart Background Service
                    </Button>
                    <Button onClick={generateQR} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                      Force New QR / Logout
                    </Button>
                  </div>
                )}
                
                {status?.session?.status === 'qr_ready' && status?.session?.qr_code && (
                  <div className="mt-6 flex flex-col items-center bg-gray-50 border-2 border-dashed border-gray-300 p-8 rounded-xl shadow-inner">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp Web Login</h3>
                      <p className="text-sm text-gray-600">Scan this code with the WhatsApp app on your phone to link your account.</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-md mb-6 flex justify-center bg-white">
                      <QRCodeSVG 
                        value={status.session.qr_code} 
                        size={256} 
                        level="H" 
                        includeMargin={true}
                      />
                    </div>
                    
                    <Button variant="outline" onClick={restart} className="w-full max-w-xs">
                      Cancel & Restart
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Queue Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin text-primary" /> : (
              <div className="space-y-4">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Failed Messages</span>
                  <span className="text-red-400 font-bold">{status?.failedCount || 0}</span>
                </div>
                {/* Additional metrics could be added here if exposed by bullmq */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3">Recipient</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Error Log</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border bg-card">
                    <td className="px-6 py-4">{log.recipient}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                        log.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 text-red-400 max-w-xs truncate" title={log.error_log}>{log.error_log || '-'}</td>
                  </tr>
                ))}
                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">No recent messages</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-10 p-4 bg-gray-900 text-green-400 font-mono text-xs overflow-auto rounded-lg">
        <p className="text-white font-bold mb-2">--- DIAGNOSTIC DEBUG DATA ---</p>
        <pre>{JSON.stringify({ status, loading }, null, 2)}</pre>
      </div>
    </div>
  );
};
