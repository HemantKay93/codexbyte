import React, { useEffect, useState } from 'react';
import { Card, Button } from '@byteevolvr/ui';
import {
  Loader2,
  RefreshCw,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Phone,
  Building2,
  Key,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { apiClient } from '@byteevolvr/api-client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

import { WhatsAppProviderSettings } from './WhatsAppProviderSettings';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SessionStatus {
  status: 'connected' | 'disconnected' | 'pending' | string;
  last_active: string | null;
}

interface SystemStatus {
  session: SessionStatus | null;
  failedCount: number;
}

interface HealthResult {
  connected: boolean;
  message: string;
  phoneInfo: {
    id: string;
    displayPhoneNumber: string;
    verifiedName: string;
  } | null;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const isConnected = status === 'connected';
  const isPending = status === 'pending';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
        isConnected
          ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30'
          : isPending
            ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30'
            : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
      }`}
    >
      {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {status.toUpperCase()}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const WhatsAppDashboard = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [healthResult, setHealthResult] = useState<HealthResult | null>(null);

  // Test message state
  const [testTo, setTestTo] = useState('');
  const [testMsg, setTestMsg] = useState('');
  const [sending, setSending] = useState(false);

  // ── Fetch Status & Logs with TanStack Query ────────────────────────────────
  const { data: statusData, refetch: fetchStatus } = useQuery({
    queryKey: ['whatsapp_status'],
    queryFn: async () => {
      const res = await apiClient.get(`/whatsapp/status`);
      return res.data;
    },
    refetchInterval: 15000,
  });

  const { data: logsData } = useQuery({
    queryKey: ['whatsapp_logs'],
    queryFn: async () => {
      const res = await apiClient.get('/whatsapp/logs?limit=15');
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (statusData) setStatus(statusData);
    if (logsData) setLogs(logsData);
    setLoading(false);
  }, [statusData, logsData]);

  // ── Verify Webhook Connection ──────────────────────────────────────────────
  const checkWebhook = async (e: React.MouseEvent) => {
    e.preventDefault();
    setVerifying(true);
    setHealthResult(null);
    try {
      const res = await apiClient.get('/whatsapp/webhook/health');
      // res.data is already the unwrapped inner data object from the interceptor
      // The health endpoint returns { success, connected, message, phoneInfo }
      // After unwrapping: res.data = { connected, message, phoneInfo } if success was true
      // But our new endpoint doesn't wrap in { success, data } — it returns directly
      // So res.data will be the full { success, connected, message, phoneInfo }
      const payload = res.data;

      const isConnected = payload?.connected === true;
      const message = payload?.message || (isConnected ? 'Connected!' : 'Not connected');
      const phoneInfo = payload?.phoneInfo || null;

      setHealthResult({ connected: isConnected, message, phoneInfo });

      // Also refresh the session status to update the badge immediately
      await fetchStatus();

      if (isConnected) {
        toast.success(`✅ ${message}`);
      } else {
        toast.error(`❌ ${message}`);
      }
    } catch (err: any) {
      const msg =
        err?.customMessage || err?.message || 'Failed to reach backend. Check server logs.';
      setHealthResult({ connected: false, message: msg, phoneInfo: null });
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  // Ref guard to prevent double-submissions from React StrictMode or rapid clicks
  const sendingRef = React.useRef(false);

  // ── Send Test Message ──────────────────────────────────────────────────────
  const sendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = testTo.trim();
    const message = testMsg.trim();

    if (!phone || !message) {
      toast.warning('Enter both a phone number and a message.');
      return;
    }

    // Guard: block if already in-flight
    if (sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    try {
      await apiClient.post('/whatsapp/test-message', { to: phone, message });
      toast.success('Message queued successfully! Check Recent Messages below.');
      setTestMsg('');
      setTimeout(() => fetchStatus(), 2000);
    } catch (err: any) {
      const msg = err?.customMessage || err?.message || 'Failed to send test message.';
      toast.error(msg);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  // Removed manual interval polling, TanStack Query handles it via refetchInterval

  const sessionStatus = status?.session?.status || 'disconnected';
  const lastActive = status?.session?.last_active;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageCircle className="text-green-500 h-6 w-6" />
          WhatsApp Integration
        </h1>
        <Button
          onClick={() => fetchStatus()}
          variant="outline"
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ── Status + Verify Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Status Card */}
        <Card>
          <div>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-500" />
              Cloud API Status
            </div>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading status...
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="text-sm text-muted-foreground">Provider</span>
                  <span className="text-sm font-semibold text-blue-400">META CLOUD API</span>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="text-sm text-muted-foreground">Connection</span>
                  <StatusBadge status={sessionStatus} />
                </div>
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="text-sm text-muted-foreground">Last Webhook Event</span>
                  <span className="text-sm">
                    {lastActive ? new Date(lastActive).toLocaleString() : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="text-sm text-muted-foreground">Failed Messages</span>
                  <span
                    className={`text-sm font-bold ${(status?.failedCount || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}
                  >
                    {status?.failedCount || 0}
                  </span>
                </div>

                {/* Verify Result */}
                {healthResult && (
                  <div
                    className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                      healthResult.connected
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {healthResult.connected ? (
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">{healthResult.message}</p>
                      {healthResult.phoneInfo && (
                        <div className="mt-2 space-y-1 text-xs opacity-80">
                          <p className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />{' '}
                            {healthResult.phoneInfo.displayPhoneNumber}
                          </p>
                          <p className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {healthResult.phoneInfo.verifiedName}
                          </p>
                          <p className="flex items-center gap-1">
                            <Key className="h-3 w-3" /> ID: {healthResult.phoneInfo.id}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={checkWebhook} disabled={verifying} className="w-full gap-2">
                    {verifying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wifi className="h-4 w-4" />
                    )}
                    {verifying ? 'Verifying...' : 'Verify Webhook Connection'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => (window.location.href = '/settings')}
                  >
                    <Key className="h-4 w-4" />
                    Configure API Credentials
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Test Message Card */}
        <Card>
          <div>
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-blue-400" />
              Send Test Message
            </div>
          </div>
          <div>
            <form onSubmit={sendTestMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Recipient Phone Number
                </label>
                <input
                  type="text"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="919876543210 (no + or spaces)"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code without +. Example: 919876543210
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Message
                </label>
                <textarea
                  value={testMsg}
                  onChange={(e) => setTestMsg(e.target.value)}
                  placeholder="Hello! This is a test message from ByteEvolvr."
                  rows={4}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-400">
                  You can only send messages to numbers that have messaged your WhatsApp Business
                  number first, OR use an approved message template.
                </p>
              </div>
              <Button type="submit" disabled={sending} className="w-full gap-2">
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {sending ? 'Sending...' : 'Send Test Message'}
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Multi-Provider Configuration */}
      <WhatsAppProviderSettings />

      {/* Recent Messages Log */}
      <Card>
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Recent Messages
          </div>
        </div>
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Error</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{log.recipient}</td>
                    <td
                      className="px-4 py-3 max-w-[180px] truncate text-muted-foreground"
                      title={log.payload?.content}
                    >
                      {log.payload?.content || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs uppercase text-muted-foreground font-semibold">
                      {log.provider_used || 'unknown'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          log.status === 'delivered'
                            ? 'bg-green-500/20 text-green-400'
                            : log.status === 'sent'
                              ? 'bg-blue-500/20 text-blue-400'
                              : log.status === 'failed'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {log.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td
                      className="px-4 py-3 text-red-400 text-xs max-w-[160px] truncate"
                      title={log.error_log}
                    >
                      {log.error_log || '—'}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No messages sent yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};
