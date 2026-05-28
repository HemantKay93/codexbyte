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

export interface JournalEntry {
  id?: string;
  entry_date: string;
  account_type: 'Revenue' | 'Expense' | 'Asset' | 'Liability' | 'Equity';
  account_name: string;
  amount: number;
  is_credit: boolean;
  description?: string;
  reference_type?: 'invoice' | 'order' | 'manual';
  reference_id?: string;
  created_by?: string;
  created_at?: string;
}
