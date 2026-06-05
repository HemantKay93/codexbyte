import { Card, Button, Input } from '@byteevolvr/ui';
import { Save, Settings2 } from 'lucide-react';

export function AccountingSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Accounting Settings</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Configure default accounts, tax rates, and financial rules
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <div className="bg-surface-container p-3 rounded-lg font-medium text-primary cursor-pointer">
            General
          </div>
          <div className="p-3 rounded-lg text-on-surface-variant hover:bg-surface-container/50 cursor-pointer transition-colors">
            Taxes & GST
          </div>
          <div className="p-3 rounded-lg text-on-surface-variant hover:bg-surface-container/50 cursor-pointer transition-colors">
            Default Accounts
          </div>
          <div className="p-3 rounded-lg text-on-surface-variant hover:bg-surface-container/50 cursor-pointer transition-colors">
            Invoicing
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-outline-variant pb-4">
              <Settings2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-on-surface">General Preferences</h2>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Base Currency
                  </label>
                  <select
                    className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2 text-sm"
                    defaultValue="INR"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Date Format
                  </label>
                  <select
                    className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2 text-sm"
                    defaultValue="DD/MM/YYYY"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Financial Year Start Month
                </label>
                <select
                  className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2 text-sm"
                  defaultValue="April"
                >
                  <option value="January">January</option>
                  <option value="April">April</option>
                  <option value="July">July</option>
                  <option value="October">October</option>
                </select>
                <p className="text-xs text-on-surface-variant mt-1">
                  This determines how your accounting periods are calculated.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Lock Entries Before
                </label>
                <Input type="date" className="w-full" />
                <p className="text-xs text-on-surface-variant mt-1">
                  Prevent any edits to transactions prior to this date (useful for closed periods).
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-outline-variant pb-4">
              <Settings2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-on-surface">Default Ledger Accounts</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Accounts Receivable (A/R)
                </label>
                <select
                  className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2 text-sm"
                  defaultValue="1200"
                >
                  <option value="1200">1200 - Accounts Receivable</option>
                  <option value="1210">1210 - Trade Debtors</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Accounts Payable (A/P)
                </label>
                <select
                  className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2 text-sm"
                  defaultValue="2000"
                >
                  <option value="2000">2000 - Accounts Payable</option>
                  <option value="2010">2010 - Trade Creditors</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Retained Earnings
                </label>
                <select
                  className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2 text-sm"
                  defaultValue="3500"
                >
                  <option value="3500">3500 - Retained Earnings</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
