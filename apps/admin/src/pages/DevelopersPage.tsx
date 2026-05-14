import { useState } from 'react';
import { Card, CardContent, Button, Badge, Input } from '../components/ui';
import {
  Code2,
  Webhook,
  Key,
  Copy,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Zap,
  AlertCircle,
} from 'lucide-react';

const mockApiKeys = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'bek_live_xxxxxxxxxxxxxxxxxxxx',
    created: '2026-04-01',
    lastUsed: '10 mins ago',
    status: 'active',
  },
  {
    id: '2',
    name: 'Staging API Key',
    key: 'bek_test_yyyyyyyyyyyyyyyyyyyy',
    created: '2026-03-15',
    lastUsed: '2 days ago',
    status: 'active',
  },
];

const mockWebhooks = [
  {
    id: '1',
    url: 'https://myapp.io/webhooks/orders',
    events: ['order.created', 'order.updated'],
    status: 'active',
    lastTriggered: '5 mins ago',
  },
  {
    id: '2',
    url: 'https://erp.company.com/api/stock',
    events: ['inventory.low'],
    status: 'failing',
    lastTriggered: '1 hour ago',
  },
];

export function DevelopersPage() {
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">
            Developer API & Webhooks
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage API credentials, webhooks, and platform integrations
          </p>
        </div>
        <a
          href="https://docs.byteevolvr.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1.5"
        >
          <Code2 className="h-4 w-4" />
          API Documentation →
        </a>
      </div>

      {/* API Keys Section */}
      <Card>
        <div className="p-4 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-on-surface">API Keys</h2>
              <p className="text-xs text-on-surface-variant">
                Use these keys to authenticate requests from your application.
              </p>
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Generate New Key
          </Button>
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="p-3 rounded-lg bg-warning-container/50 border border-warning/20 text-sm text-on-warning-container flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Never expose your <code className="font-mono font-bold">live</code> API keys in public
              repositories or client-side code.
            </span>
          </div>

          {mockApiKeys.map((key) => (
            <div
              key={key.id}
              className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-on-surface">{key.name}</span>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Created {key.created} · Last used {key.lastUsed}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={key.status === 'active' ? 'success' : 'error'}>
                    {key.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-error hover:bg-error/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-surface-container p-2.5 rounded-md text-on-surface-variant border border-outline-variant">
                  {revealedKey === key.id ? key.key : '•'.repeat(40)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setRevealedKey(revealedKey === key.id ? null : key.id)}
                >
                  {revealedKey === key.id ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Webhooks Section */}
      <Card>
        <div className="p-4 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Webhook className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Webhooks</h2>
              <p className="text-xs text-on-surface-variant">
                Receive real-time notifications when events occur in your store.
              </p>
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Webhook
          </Button>
        </div>
        <CardContent className="p-6 space-y-4">
          {mockWebhooks.map((webhook) => (
            <div
              key={webhook.id}
              className={`p-4 rounded-xl border ${webhook.status === 'failing' ? 'border-error/40 bg-error/5' : 'border-outline-variant bg-surface-container-lowest'} space-y-2`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={webhook.status === 'active' ? 'success' : 'error'}>
                      {webhook.status}
                    </Badge>
                    {webhook.status === 'failing' && (
                      <span className="text-xs text-error font-medium">
                        Retrying — check endpoint availability
                      </span>
                    )}
                  </div>
                  <code className="text-sm font-mono text-on-surface">{webhook.url}</code>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {webhook.events.map((e) => (
                      <span
                        key={e}
                        className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="sm" className="gap-1 text-primary">
                    <Zap className="h-3 w-3" /> Test
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-error hover:bg-error/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-on-surface-variant">
                Last triggered: {webhook.lastTriggered}
              </div>
            </div>
          ))}

          {/* Add New Webhook Inline */}
          <div className="p-4 rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest space-y-3">
            <h4 className="text-sm font-semibold text-on-surface">Add a New Endpoint</h4>
            <Input
              placeholder="https://your-domain.com/webhook"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {[
                'order.created',
                'order.updated',
                'order.cancelled',
                'inventory.low',
                'customer.created',
              ].map((evt) => (
                <label key={evt} className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                  <span className="font-mono text-on-surface-variant">{evt}</span>
                </label>
              ))}
            </div>
            <Button size="sm">Save Endpoint</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
