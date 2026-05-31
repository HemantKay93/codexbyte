export interface Account {
  id?: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  subtype?: string;
  parent_account_id?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface JournalHeader {
  id?: string;
  reference_type?: 'invoice' | 'order' | 'payment' | 'manual' | 'bill' | 'expense' | 'bank_transaction';
  reference_id?: string;
  transaction_date: string;
  description?: string;
  status?: 'draft' | 'posted' | 'void';
  created_by?: string;
  approved_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JournalLine {
  id?: string;
  journal_header_id?: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  created_at?: string;
}

// Keeping basic legacy invoice for compatibility if needed elsewhere, 
// but we will eventually replace this with AR/AP modules.
export interface InvoiceLineItem {
  id?: string;
  invoice_id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  total_price: number;
}

export interface Invoice {
  id?: string;
  invoice_number: string;
  type: 'b2b' | 'b2c';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_gst?: string;
  customer_address?: string;
  subtotal: number;
  tax_total: number;
  total: number;
  due_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  line_items?: InvoiceLineItem[];
}
