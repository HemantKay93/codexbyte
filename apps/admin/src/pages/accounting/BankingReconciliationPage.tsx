import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@byteevolvr/ui';
import { Loader2, RefreshCw, CheckCircle, X } from 'lucide-react';
import { AccountingService } from '@byteevolvr/api-client';

export function BankingReconciliationPage() {
  const [loading, setLoading] = useState(true);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [unreconciled, setUnreconciled] = useState<any[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [journalId, setJournalId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        setLoading(true);
        const data = await AccountingService.getBankAccounts();
        setBankAccounts(data.data || []);
        if (data.data?.length > 0) {
          setSelectedBank(data.data[0].id);
        }
      } catch (error) {
        console.error('Failed to load bank accounts', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBankAccounts();
  }, []);

  const fetchUnreconciled = async () => {
    if (!selectedBank) return;
    try {
      setLoading(true);
      const data = await AccountingService.getUnreconciledTransactions(selectedBank);
      setUnreconciled(data.data || []);
    } catch (error) {
      console.error('Failed to load unreconciled transactions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreconciled();
  }, [selectedBank]);

  const handleOpenReconcile = (tx: any) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  const submitReconcile = async () => {
    if (!journalId) return;
    try {
      setIsSubmitting(true);
      await AccountingService.reconcileTransaction(selectedTx.id, journalId);
      setIsModalOpen(false);
      setJournalId('');
      setSelectedTx(null);
      await fetchUnreconciled();
    } catch (error) {
      console.error('Failed to reconcile', error);
      alert('Error reconciling transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto min-h-[calc(100vh-8rem)] relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Banking Reconciliation</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Match bank transactions with journal entries
          </p>
        </div>
        <Button className="gap-2" variant="outline">
          <RefreshCw className="h-4 w-4" /> Sync Bank Feeds
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="col-span-1 p-4 h-fit">
          <h3 className="font-semibold text-on-surface mb-4">Bank Accounts</h3>
          {loading && !bankAccounts.length ? (
            <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : bankAccounts.length === 0 ? (
            <div className="text-sm text-on-surface-variant">No bank accounts linked.</div>
          ) : (
            <div className="space-y-2">
              {bankAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => setSelectedBank(account.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedBank === account.id ? 'border-primary bg-primary/10' : 'border-outline-variant hover:bg-surface-variant/30'}`}
                >
                  <div className="font-medium">{account.bank_name}</div>
                  <div className="text-xs text-on-surface-variant font-mono">**** {account.account_number.slice(-4)}</div>
                  <div className="text-sm font-bold mt-2">₹{account.current_balance?.toLocaleString()}</div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="col-span-1 md:col-span-3 p-0">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-semibold text-on-surface">Unreconciled Transactions</h3>
            <Badge variant="warning">{unreconciled.length} Items</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-container-lowest text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading && unreconciled.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : unreconciled.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-on-surface-variant">
                      <CheckCircle className="h-10 w-10 text-success mx-auto mb-2 opacity-50" />
                      All transactions are reconciled for this account.
                    </td>
                  </tr>
                ) : (
                  unreconciled.map(tx => (
                    <tr key={tx.id} className="hover:bg-surface-variant/20">
                      <td className="px-4 py-4">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                      <td className="px-4 py-4 font-medium">{tx.description}</td>
                      <td className="px-4 py-4">
                        <Badge variant={tx.type === 'credit' ? 'success' : 'error'}>
                          {tx.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right font-bold">
                        ₹{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button size="sm" onClick={() => handleOpenReconcile(tx)}>Match</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {isModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 bg-surface shadow-2xl relative">
            <button 
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-2 text-on-surface">Match Transaction</h2>
            <div className="mb-4 text-sm text-on-surface-variant bg-surface-variant/30 p-3 rounded-lg">
              <p><strong>Bank Tx:</strong> {selectedTx.description}</p>
              <p><strong>Amount:</strong> ₹{selectedTx.amount}</p>
              <p><strong>Date:</strong> {new Date(selectedTx.transaction_date).toLocaleDateString()}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Journal Header ID to match</label>
                <input 
                  type="text"
                  placeholder="e.g. jrn-1234..."
                  className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  value={journalId}
                  onChange={e => setJournalId(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={submitReconcile} disabled={!journalId || isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Reconcile & Match
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
