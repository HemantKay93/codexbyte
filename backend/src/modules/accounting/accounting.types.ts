export interface Account {
  id?: string;
  tenant_id?: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  sub_type?: string;
  parent_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface JournalHeader {
  id?: string;
  tenant_id?: string;
  voucher_number: string;
  transaction_date: string;
  fiscal_period_id?: string;
  reference_type?: string;
  reference_id?: string;
  status?: 'draft' | 'posted' | 'cancelled';
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JournalLine {
  id?: string;
  journal_id?: string;
  account_id: string;
  description?: string;
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
