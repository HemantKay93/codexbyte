import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import { Plus, Search, Filter, Loader2, X, Trash2 } from 'lucide-react';
import { AccountingService } from '@byteevolvr/api-client';

export function JournalEntriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState([
    { account_id: '', debit_amount: 0, credit_amount: 0 },
    { account_id: '', debit_amount: 0, credit_amount: 0 },
  ]);

  const fetchEntries = async () => {
    try {
      const data = await AccountingService.getJournalEntries();
      setEntries(data.data || []);
      const accs = await AccountingService.getAccounts();
      setAccounts(accs.data || []);
    } catch (error) {
      console.error('Failed to load journal entries', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchEntries();
  }, []);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || lines.some((l) => !l.account_id)) return;

    const totalDebit = lines.reduce((acc, l) => acc + Number(l.debit_amount), 0);
    const totalCredit = lines.reduce((acc, l) => acc + Number(l.credit_amount), 0);

    if (totalDebit !== totalCredit) {
      alert(`Debits (${totalDebit}) and Credits (${totalCredit}) must balance!`);
      return;
    }

    try {
      setIsSubmitting(true);
      const header = { description, transaction_date: transactionDate, status: 'posted' };
      await AccountingService.createJournalEntry(header, lines);
      setIsModalOpen(false);
      setDescription('');
      setLines([
        { account_id: '', debit_amount: 0, credit_amount: 0 },
        { account_id: '', debit_amount: 0, credit_amount: 0 },
      ]);
      await fetchEntries();
    } catch (error: any) {
      console.error('Failed to create journal entry', error);
      alert(`Error: ${error.message || 'Failed to create journal entry'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLine = () => {
    setLines([...lines, { account_id: '', debit_amount: 0, credit_amount: 0 }]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDebit = lines.reduce((acc, l) => acc + Number(l.debit_amount), 0);
  const totalCredit = lines.reduce((acc, l) => acc + Number(l.credit_amount), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-8rem)] relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Journal Entries</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manual double-entry ledger inputs
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" /> New Entry
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Search by description or ID..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filters
          </Button>
        </div>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Entry ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Account Lines</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-on-surface-variant">
                    No journal entries found. Click 'New Entry' to create one.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.transaction_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono text-xs">{entry.id.split('-')[0]}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {entry.lines?.map((line: any) => (
                          <div
                            key={line.id}
                            className="flex justify-between text-xs w-64 border-b border-outline-variant/30 pb-1 last:border-0"
                          >
                            <span className="truncate pr-2">
                              {line.account?.name || 'Unknown Account'}
                            </span>
                            <span className="font-medium shrink-0">
                              {Number(line.debit_amount) > 0 ? (
                                <span className="text-on-surface">
                                  DR ₹{Number(line.debit_amount).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-on-surface-variant">
                                  CR ₹{Number(line.credit_amount).toLocaleString()}
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.status === 'posted' ? 'success' : 'warning'}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-4xl p-6 bg-surface shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-6 text-on-surface">Create Journal Entry</h2>

            <form onSubmit={handleCreateEntry} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">
                    Description
                  </label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Office Rent Payment"
                    required
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-on-surface mb-2">Journal Lines</h3>
                <div className="border border-outline-variant rounded-lg overflow-hidden">
                  <div className="w-full overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-surface-container text-on-surface-variant border-b border-outline-variant">
                        <tr>
                          <th className="px-4 py-2">Account</th>
                          <th className="px-4 py-2 w-32">Debit (DR)</th>
                          <th className="px-4 py-2 w-32">Credit (CR)</th>
                          <th className="px-4 py-2 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {lines.map((line, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2">
                              <select
                                className="w-full h-9 px-2 rounded border border-outline bg-surface text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                value={line.account_id}
                                onChange={(e) => updateLine(idx, 'account_id', e.target.value)}
                                required
                              >
                                <option value="">Select Account...</option>
                                {accounts.map((acc) => (
                                  <option key={acc.id} value={acc.id}>
                                    {acc.code} - {acc.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={line.debit_amount || ''}
                                onChange={(e) =>
                                  updateLine(idx, 'debit_amount', Number(e.target.value))
                                }
                                disabled={line.credit_amount > 0}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={line.credit_amount || ''}
                                onChange={(e) =>
                                  updateLine(idx, 'credit_amount', Number(e.target.value))
                                }
                                disabled={line.debit_amount > 0}
                              />
                            </td>
                            <td className="px-4 py-2 text-center">
                              {lines.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeLine(idx)}
                                  className="text-error hover:bg-error/10 p-1 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-surface-container font-medium border-t border-outline-variant">
                        <tr>
                          <td className="px-4 py-3 text-right">Totals:</td>
                          <td
                            className={`px-4 py-3 ${totalDebit === totalCredit ? 'text-success' : 'text-error'}`}
                          >
                            ₹{totalDebit.toLocaleString()}
                          </td>
                          <td
                            className={`px-4 py-3 ${totalDebit === totalCredit ? 'text-success' : 'text-error'}`}
                          >
                            ₹{totalCredit.toLocaleString()}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={addLine}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Line
                </Button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || totalDebit !== totalCredit || totalDebit === 0}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Post Journal
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
