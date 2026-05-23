import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button } from '../components/ui';
import { CMSService } from '@byteevolvr/api-client';
import { Loader2, Save } from 'lucide-react';

export function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    storeName: '',
    supportEmail: '',
    phone: '',
    address: '',
    currency: 'INR (₹)',
  });

  const [apiConfig, setApiConfig] = useState({
    publicKey: '',
    secretKey: '',
  });

  const [whatsappConfig, setWhatsappConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    webhookVerifyToken: '',
  });

  const [emailConfig, setEmailConfig] = useState({
    activeProvider: 'resend', // 'resend' | 'brevo' | 'smtp'
    resendApiKey: '',
    brevoApiKey: '',
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: '',
    smtpSecure: false,
    defaultFromAddress: 'noreply@byteevolvr.com',
  });

  const [pushConfig, setPushConfig] = useState({
    fcmServerKey: '',
  });

  useEffect(() => {
    fetchSettings();
    fetchApiConfig();
  }, []);

  const fetchApiConfig = async () => {
    try {
      const data = await CMSService.getContent('global');
      const api = data?.find((s: any) => s.section_key === 'api_config')?.content || {};
      setApiConfig({
        publicKey: api.publicKey || `pk_live_${Math.random().toString(36).substring(2, 15)}`,
        secretKey: api.secretKey || `sk_live_${Math.random().toString(36).substring(2, 15)}`,
      });

      const wa = data?.find((s: any) => s.section_key === 'whatsapp_config')?.content || {};
      setWhatsappConfig({
        accessToken: wa.accessToken || '',
        phoneNumberId: wa.phoneNumberId || '',
        businessAccountId: wa.businessAccountId || '',
        webhookVerifyToken: wa.webhookVerifyToken || crypto.randomUUID().replace(/-/g, ''),
      });

      const emailConf = data?.find((s: any) => s.section_key === 'email_config')?.content || {};
      setEmailConfig({
        activeProvider: emailConf.activeProvider || 'resend',
        resendApiKey: emailConf.resendApiKey || '',
        brevoApiKey: emailConf.brevoApiKey || '',
        smtpHost: emailConf.smtpHost || '',
        smtpPort: emailConf.smtpPort || '',
        smtpUser: emailConf.smtpUser || '',
        smtpPass: emailConf.smtpPass || '',
        smtpSecure: emailConf.smtpSecure || false,
        defaultFromAddress: emailConf.defaultFromAddress || 'noreply@byteevolvr.com',
      });

      const pushConf = data?.find((s: any) => s.section_key === 'push_config')?.content || {};
      setPushConfig({
        fcmServerKey: pushConf.fcmServerKey || '',
      });
    } catch (err) {
      console.error('Failed to fetch API config:', err);
    }
  };

  const handleRegenerateKeys = () => {
    const newPk = `pk_live_${crypto.randomUUID().replace(/-/g, '')}`;
    const newSk = `sk_live_${crypto.randomUUID().replace(/-/g, '')}`;
    setApiConfig({ publicKey: newPk, secretKey: newSk });
  };

  const saveApiConfig = async () => {
    setSaving(true);
    try {
      await CMSService.updateContent('global', 'api_config', {
        publicKey: apiConfig.publicKey,
        secretKey: apiConfig.secretKey,
        updatedAt: new Date().toISOString(),
      });
      alert('API Configuration saved successfully!');
    } catch (err) {
      alert('Failed to save API configuration.');
    } finally {
      setSaving(false);
    }
  };

  const saveWhatsappConfig = async () => {
    setSaving(true);
    try {
      await CMSService.updateContent('global', 'whatsapp_config', {
        ...whatsappConfig,
        updatedAt: new Date().toISOString(),
      });
      alert('WhatsApp Configuration saved successfully!');
    } catch (err) {
      alert('Failed to save WhatsApp configuration.');
    } finally {
      setSaving(false);
    }
  };

  const saveEmailConfig = async () => {
    setSaving(true);
    try {
      await CMSService.updateContent('global', 'email_config', {
        ...emailConfig,
        updatedAt: new Date().toISOString(),
      });
      alert('Email Configuration saved successfully!');
    } catch (err) {
      alert('Failed to save Email configuration.');
    } finally {
      setSaving(false);
    }
  };

  const savePushConfig = async () => {
    setSaving(true);
    try {
      await CMSService.updateContent('global', 'push_config', {
        ...pushConfig,
        updatedAt: new Date().toISOString(),
      });
      alert('Push Configuration saved successfully!');
    } catch (err) {
      alert('Failed to save Push configuration.');
    } finally {
      setSaving(false);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await CMSService.getContent('global');
      const contact = data?.find((s: any) => s.section_key === 'contact')?.content || {};

      setSettings({
        storeName: contact.storeName || 'ByteEvolvr Official Store',
        supportEmail: contact.email || 'hello@byteevolvr.com',
        phone: contact.phone || '+91 78889 57575',
        address:
          contact.address ||
          'Chaltakonda, Routhkhanda, Near Kali Mata Mandir, Joypur, Bankura, West Bengal - 722138',
        currency: 'INR (₹)',
      });
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update global contact section which is used for store details
      await CMSService.updateContent('global', 'contact', {
        storeName: settings.storeName,
        email: settings.supportEmail,
        phone: settings.phone,
        address: settings.address,
        workingHours: 'Mon-Sat: 9:00 AM - 7:00 PM', // Preserve default
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-display-sm font-semibold text-on-background">Platform Settings</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Manage your store preferences and configurations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Store Name"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            />
            <Input
              label="Support Email"
              value={settings.supportEmail}
              type="email"
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            />
            <Input
              label="Phone Number"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
            <Input label="Currency" value={settings.currency} disabled />
          </div>
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1 font-medium">
              Store Address
            </label>
            <textarea
              className="w-full rounded-md border border-outline bg-surface px-3 py-2 text-body-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors min-h-[100px]"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            ></textarea>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Public API Key"
                value={apiConfig.publicKey}
                type="text"
                readOnly
                className="font-mono text-xs"
              />
              <p className="text-xs text-on-surface-variant mt-1">Used for frontend integrations</p>
            </div>
            <div>
              <Input
                label="Secret API Key"
                value={apiConfig.secretKey}
                type="password"
                readOnly
                className="font-mono text-xs"
              />
              <p className="text-xs text-on-surface-variant mt-1">
                Keep this key private and secure
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleRegenerateKeys} disabled={saving}>
              Regenerate Keys
            </Button>
            <Button onClick={saveApiConfig} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Cloud API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Permanent Access Token"
              value={whatsappConfig.accessToken}
              type="password"
              onChange={(e) => setWhatsappConfig({ ...whatsappConfig, accessToken: e.target.value })}
              placeholder="EAAI..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Phone Number ID"
              value={whatsappConfig.phoneNumberId}
              onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phoneNumberId: e.target.value })}
            />
            <Input
              label="Business Account ID"
              value={whatsappConfig.businessAccountId}
              onChange={(e) => setWhatsappConfig({ ...whatsappConfig, businessAccountId: e.target.value })}
            />
            <Input
              label="Webhook Verify Token"
              value={whatsappConfig.webhookVerifyToken}
              onChange={(e) => setWhatsappConfig({ ...whatsappConfig, webhookVerifyToken: e.target.value })}
              className="font-mono text-xs"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={saveWhatsappConfig} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save WhatsApp Config
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Marketing Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1 font-medium">
                Active Provider
              </label>
              <select
                className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-body-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={emailConfig.activeProvider}
                onChange={(e) => setEmailConfig({ ...emailConfig, activeProvider: e.target.value })}
              >
                <option value="resend">Resend</option>
                <option value="brevo">Brevo</option>
                <option value="smtp">Custom SMTP</option>
              </select>
            </div>
            <Input
              label="Default 'From' Address"
              value={emailConfig.defaultFromAddress}
              onChange={(e) => setEmailConfig({ ...emailConfig, defaultFromAddress: e.target.value })}
              placeholder="noreply@byteevolvr.com"
            />
          </div>
          
          {emailConfig.activeProvider === 'resend' && (
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Resend API Key"
                value={emailConfig.resendApiKey}
                type="password"
                onChange={(e) => setEmailConfig({ ...emailConfig, resendApiKey: e.target.value })}
                placeholder="re_..."
              />
            </div>
          )}

          {emailConfig.activeProvider === 'brevo' && (
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Brevo API Key"
                value={emailConfig.brevoApiKey}
                type="password"
                onChange={(e) => setEmailConfig({ ...emailConfig, brevoApiKey: e.target.value })}
                placeholder="xkeysib-..."
              />
            </div>
          )}

          {emailConfig.activeProvider === 'smtp' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="SMTP Host"
                  value={emailConfig.smtpHost}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                  placeholder="smtp.example.com"
                />
                <Input
                  label="SMTP Port"
                  value={emailConfig.smtpPort}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                  placeholder="587"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="SMTP Username"
                  value={emailConfig.smtpUser}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                  placeholder="user@example.com"
                />
                <Input
                  label="SMTP Password"
                  value={emailConfig.smtpPass}
                  type="password"
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpPass: e.target.value })}
                  placeholder="********"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="smtpSecure"
                  checked={emailConfig.smtpSecure}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpSecure: e.target.checked })}
                  className="rounded border-outline text-primary focus:ring-primary"
                />
                <label htmlFor="smtpSecure" className="text-body-sm text-on-surface">
                  Use Secure Connection (SSL/TLS - usually for port 465)
                </label>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={saveEmailConfig} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Email Config
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push Notification Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Firebase Server Key (Legacy FCM)"
              value={pushConfig.fcmServerKey}
              type="password"
              onChange={(e) => setPushConfig({ ...pushConfig, fcmServerKey: e.target.value })}
              placeholder="AAAA..."
            />
            <p className="text-xs text-on-surface-variant mt-1">
              Required to send Web Push Notifications to your subscribed users.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={savePushConfig} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Push Config
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
