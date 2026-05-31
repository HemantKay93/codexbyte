import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@byteevolvr/ui';
import { Loader2, Plus, Layers, X } from 'lucide-react';
import { AccountingService } from '@byteevolvr/api-client';

export function ChartOfAccountsPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Asset');
  const [currency, setCurrency] = useState('INR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await AccountingService.getAccounts();
      setAccounts(data.data || []);
    } catch (error) {
      console.error('Failed to load accounts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    
    try {
      setIsSubmitting(true);
      await AccountingService.createAccount({
        code,
        name,
        type,
        currency
      });
      setIsModalOpen(false);
      setCode('');
      setName('');
      setType('Asset');
      await fetchAccounts();
    } catch (error) {
      console.error('Failed to create account', error);
      alert('Error creating account');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group accounts by type
  const groupedAccounts = accounts.reduce((acc, account) => {
    const t = account.type || 'Other';
    if (!acc[t]) acc[t] = [];
    acc[t].push(account);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6 max-w-5xl mx-auto relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Chart of Accounts</h1>
          <p className="text-on-surface-variant mt-1">Manage ledger accounts and hierarchies</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" /> New Account
        </Button>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedAccounts).map(([t, accs]) => (
          <Card key={t} className="p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-outline-variant pb-2">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-on-surface">{t}</h2>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="text-on-surface-variant uppercase text-xs border-b border-outline-variant">
                <tr>
                  <th className="py-2 px-4 w-1/4">Code</th>
                  <th className="py-2 px-4 w-1/2">Name</th>
                  <th className="py-2 px-4 w-1/4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {accs.map(acc => (
                  <tr key={acc.id} className="hover:bg-surface-variant/30">
                    <td className="py-3 px-4 text-on-surface-variant font-mono">{acc.code}</td>
                    <td className="py-3 px-4 font-medium text-on-surface">{acc.name}</td>
                    <td className="py-3 px-4 text-right font-medium">₹{(acc.current_balance || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
        {accounts.length === 0 && (
          <div className="text-center p-12 text-on-surface-variant bg-surface-variant/20 rounded-xl">
            No accounts found.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 bg-surface shadow-2xl relative">
            <button 
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-on-surface">Create New Account</h2>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Code</label>
                <Input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. 1000" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cash in Hand" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Type</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-sm focus:ring-2 focus:ring-primary focus:outline-none text-on-surface"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <Button className="w-full mt-4" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
