import { useState } from 'react';
import { Card, Button, Input } from '@byteevolvr/ui';
import { Server } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@byteevolvr/api-client';

export function WhatsAppProviderSettings() {
  const queryClient = useQueryClient();

  const { data: configs, isLoading } = useQuery({
    queryKey: ['provider_configs'],
    queryFn: async () => {
      const res = await apiClient.get('/whatsapp/providers');
      return res.data;
    },
    // If endpoint doesn't exist yet, we'll gracefully mock it for UI rendering until backend is wired up
    retry: false,
    initialData: [
      {
        id: '1',
        provider_name: 'meta',
        is_enabled: true,
        priority: 1,
        config: { accessToken: '', phoneNumberId: '' },
      },
      {
        id: '2',
        provider_name: 'evolution',
        is_enabled: false,
        priority: 2,
        config: { baseUrl: '', apiKey: '', instanceName: '' },
      },
    ],
  });

  const updateConfig = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/whatsapp/providers', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider_configs'] });
      alert('Provider settings updated successfully.');
    },
    onError: (error: any) =>
      alert(
        `Failed to update provider settings: ${error?.customMessage || error?.message || 'Unknown error'}`
      ),
  });

  if (isLoading) return <div>Loading provider configuration...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-display-sm font-semibold flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" /> WhatsApp Multi-Provider Configuration
        </h2>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Manage Evolution API and Meta Cloud API. The highest priority enabled provider is the
          default.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {configs.map((provider: any) => (
          <ProviderCard
            key={provider.provider_name}
            provider={provider}
            onSave={(updatedConfig) => updateConfig.mutate({ ...provider, config: updatedConfig })}
            onToggle={(enabled) => updateConfig.mutate({ ...provider, is_enabled: enabled })}
          />
        ))}
      </div>
    </div>
  );
}

function ProviderCard({
  provider,
  onSave,
  onToggle,
}: {
  provider: any;
  onSave: (c: any) => void;
  onToggle: (e: boolean) => void;
}) {
  const [localConfig, setLocalConfig] = useState(provider.config || {});

  return (
    <Card
      className="flex flex-col h-full border-t-4"
      style={{ borderTopColor: provider.is_enabled ? '#10b981' : '#64748b' }}
    >
      <div className="p-6 flex-1 flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-title-md font-semibold capitalize">
              {provider.provider_name} Provider
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${provider.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {provider.is_enabled ? 'Active' : 'Disabled'}
              </span>
              <span className="text-xs text-on-surface-variant">Priority: {provider.priority}</span>
            </div>
          </div>
          <Button
            variant={provider.is_enabled ? 'outline' : 'primary'}
            size="sm"
            onClick={() => onToggle(!provider.is_enabled)}
          >
            {provider.is_enabled ? 'Disable' : 'Enable'}
          </Button>
        </div>

        <hr className="border-outline" />

        <div className="space-y-4 flex-1">
          {provider.provider_name === 'meta' && (
            <>
              <Input
                label="Access Token"
                type="password"
                value={localConfig.accessToken || ''}
                onChange={(e) => setLocalConfig({ ...localConfig, accessToken: e.target.value })}
              />
              <Input
                label="Phone Number ID"
                value={localConfig.phoneNumberId || ''}
                onChange={(e) => setLocalConfig({ ...localConfig, phoneNumberId: e.target.value })}
              />
            </>
          )}

          {provider.provider_name === 'evolution' && (
            <>
              <Input
                label="Base URL (VPS Endpoint)"
                placeholder="https://wa.byteevolvr.com"
                value={localConfig.baseUrl || ''}
                onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
              />
              <Input
                label="Global API Key"
                type="password"
                value={localConfig.apiKey || ''}
                onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
              />
              <Input
                label="Instance Name"
                placeholder="byteevolvr"
                value={localConfig.instanceName || ''}
                onChange={(e) => setLocalConfig({ ...localConfig, instanceName: e.target.value })}
              />
            </>
          )}
        </div>

        <Button className="w-full mt-4" onClick={() => onSave(localConfig)}>
          Save Credentials
        </Button>
      </div>
    </Card>
  );
}
