import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AccountingService } from '@byteevolvr/api-client';

export function JournalVoucherPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    AccountingService.getAccounts()
      .then((res) => {
        setAccounts(res?.data || []);
      })
      .catch((err) => {
        console.error('Failed to load accounts', err);
        // Fallback mock accounts
        setAccounts([
          { id: '1', code: '1000', name: 'Cash' },
          { id: '2', code: '1200', name: 'Accounts Receivable' },
          { id: '3', code: '5400', name: 'Office Supplies' },
          { id: '4', code: '4100', name: 'Consulting Revenue' },
        ]);
      });
  }, []);

  const [entries, setEntries] = useState([
    { id: 1, accountId: '', description: '', debit: 0, credit: 0 },
    { id: 2, accountId: '', description: '', debit: 0, credit: 0 },
  ]);

  const addEntry = () => {
    setEntries([
      ...entries,
      { id: Date.now(), accountId: '', description: '', debit: 0, credit: 0 },
    ]);
  };

  const removeEntry = (id: number) => {
    if (entries.length <= 2) return; // Maintain at least 2 entries for double-entry
    setEntries(entries.filter((e) => e.id !== id));
  };

  const updateEntry = (id: number, field: string, value: string | number) => {
    setEntries(
      entries.map((e) => {
        if (e.id === id) {
          // If setting debit, ensure credit is 0, and vice versa
          if (field === 'debit' && Number(value) > 0)
            return { ...e, debit: Number(value), credit: 0 };
          if (field === 'credit' && Number(value) > 0)
            return { ...e, credit: Number(value), debit: 0 };
          return { ...e, [field]: value };
        }
        return e;
      })
    );
  };

  const totalDebit = entries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSave = async () => {
    if (!isBalanced) return;
    setIsSubmitting(true);
    try {
      await AccountingService.createJournalEntry(
        { date, reference, notes },
        entries.filter((e) => e.accountId)
      );
      alert('Journal entry saved successfully!');
      // Reset form
      setReference('');
      setNotes('');
      setEntries([
        { id: Date.now(), accountId: '', description: '', debit: 0, credit: 0 },
        { id: Date.now() + 1, accountId: '', description: '', debit: 0, credit: 0 },
      ]);
    } catch (err) {
      console.error('Failed to save journal entry', err);
      alert('Failed to save journal entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/accounting/journal" className="text-on-surface-variant hover:text-on-surface">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-display-sm font-semibold text-on-background">
              New Journal Voucher
            </h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Create a manual journal entry
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Cancel</Button>
          <Button className="gap-2" disabled={!isBalanced || isSubmitting} onClick={handleSave}>
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Voucher'}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Reference #</label>
            <Input
              placeholder="e.g. JV-2023-001"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-on-surface mb-1">Notes</label>
            <Input
              placeholder="Description of this journal entry"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="border border-outline-variant rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-surface-container-low">
              <TableRow>
                <TableHead className="w-1/3">Account</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-32 text-right">Debit</TableHead>
                <TableHead className="w-32 text-right">Credit</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <select
                      className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2 text-sm"
                      value={entry.accountId}
                      onChange={(e) => updateEntry(entry.id, 'accountId', e.target.value)}
                    >
                      <option value="">Select Account...</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.code})
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Line description"
                      value={entry.description}
                      onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={entry.debit || ''}
                      onChange={(e) => updateEntry(entry.id, 'debit', e.target.value)}
                      className="w-full text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={entry.credit || ''}
                      onChange={(e) => updateEntry(entry.id, 'credit', e.target.value)}
                      className="w-full text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => removeEntry(entry.id)}
                      disabled={entries.length <= 2}
                      className="p-2 text-on-surface-variant hover:text-error disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} className="p-0 border-t border-outline-variant">
                  <button
                    onClick={addEntry}
                    className="w-full p-3 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Line
                  </button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-72 bg-surface-container rounded-lg p-4">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-on-surface-variant">Total Debit</span>
              <span className="font-medium text-on-surface">₹{totalDebit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="text-on-surface-variant">Total Credit</span>
              <span className="font-medium text-on-surface">₹{totalCredit.toFixed(2)}</span>
            </div>
            <div
              className={`flex justify-between items-center pt-3 border-t border-outline-variant font-medium ${isBalanced ? 'text-success' : 'text-error'}`}
            >
              <span>Difference</span>
              <span>₹{Math.abs(totalDebit - totalCredit).toFixed(2)}</span>
            </div>
            {!isBalanced && (
              <p className="text-xs text-error mt-2">Debits must equal credits to save.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
