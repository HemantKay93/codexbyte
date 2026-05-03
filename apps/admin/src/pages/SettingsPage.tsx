import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button } from '../components/ui';

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-display-sm font-semibold text-on-background">Platform Settings</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">Manage your store preferences and configurations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Store Name" defaultValue="ByteEvolvr Official Store" />
            <Input label="Support Email" defaultValue="support@byteevolvr.com" type="email" />
            <Input label="Phone Number" defaultValue="+1 (555) 123-4567" />
            <Input label="Currency" defaultValue="USD ($)" disabled />
          </div>
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1 font-medium">Store Address</label>
            <textarea 
              className="w-full rounded-md border border-outline bg-surface px-3 py-2 text-body-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors min-h-[100px]"
              defaultValue="123 Commerce St.\nSuite 400\nSan Francisco, CA 94107"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Input label="Public API Key" defaultValue="pk_live_51M..." type="password" />
            <p className="text-xs text-on-surface-variant mt-1">Used for frontend integrations</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline">Regenerate Keys</Button>
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
