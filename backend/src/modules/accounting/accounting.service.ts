import { AccountingRepository } from './accounting.repository.js';
import { Invoice, InvoiceLineItem, JournalEntry } from './accounting.types.js';
// eslint-disable-line @typescript-eslint/no-unused-vars
// eslint-disable-line @typescript-eslint/no-unused-vars

export class AccountingService {
  static async createInvoice(
    invoicePayload: Partial<Invoice>,
    lineItems: Partial<InvoiceLineItem>[]
  ) {
    // Basic validation
    if (!invoicePayload.type || !invoicePayload.customer_name || lineItems.length === 0) {
      throw new Error('Missing required fields for invoice creation');
    }

    if (invoicePayload.type === 'b2b' && !invoicePayload.customer_gst) {
      throw new Error('GST Number is required for B2B invoices');
    }

    // Calculate totals
    let subtotal = 0;
    let tax_total = 0;

    const processedLineItems = lineItems.map((item) => {
      const quantity = item.quantity || 1;
      const unit_price = item.unit_price || 0;
      const tax_rate = item.tax_rate || 0;

      const itemSubtotal = quantity * unit_price;
      const itemTaxAmount = (itemSubtotal * tax_rate) / 100;
      const itemTotal = itemSubtotal + itemTaxAmount;

      subtotal += itemSubtotal;
      tax_total += itemTaxAmount;

      return {
        product_id: item.product_id,
        description: item.description || 'Custom Item',
        quantity,
        unit_price,
        tax_rate,
        tax_amount: itemTaxAmount,
        total_price: itemTotal,
      };
    });

    const total = subtotal + tax_total;

    const fullInvoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'> = {
      invoice_number: invoicePayload.invoice_number || `INV-${Date.now()}`,
      type: invoicePayload.type as 'b2b' | 'b2c',
      status: invoicePayload.status || 'draft',
      customer_id: invoicePayload.customer_id,
      customer_name: invoicePayload.customer_name,
      customer_email: invoicePayload.customer_email,
      customer_phone: invoicePayload.customer_phone,
      customer_gst: invoicePayload.customer_gst,
      customer_address: invoicePayload.customer_address,
      due_date: invoicePayload.due_date,
      notes: invoicePayload.notes,
      subtotal,
      tax_total,
      total,
    };

    const createdInvoice = await AccountingRepository.createInvoice(
      fullInvoice,
      processedLineItems
    );

    // If it's sent or paid immediately, we post a journal entry
    if (createdInvoice.status !== 'draft' && createdInvoice.status !== 'cancelled') {
      await this.postInvoiceJournalEntry(
        createdInvoice.id,
        fullInvoice.invoice_number,
        total,
        invoicePayload.type as 'b2b' | 'b2c'
      );
    }

    return createdInvoice;
  }

  static async postInvoiceJournalEntry(
    invoiceId: string,
    invoiceNumber: string,
    amount: number,
    type: 'b2b' | 'b2c'
  ) {
    const description = `Auto-generated entry for ${type.toUpperCase()} Invoice ${invoiceNumber}`;

    // Debit Accounts Receivable
    await AccountingRepository.createJournalEntry({
      entry_date: new Date().toISOString(),
      account_type: 'Asset',
      account_name: 'Accounts Receivable',
      amount: amount,
      is_credit: false,
      description,
      reference_type: 'invoice',
      reference_id: invoiceId,
    });

    // Credit Sales Revenue
    await AccountingRepository.createJournalEntry({
      entry_date: new Date().toISOString(),
      account_type: 'Revenue',
      account_name: 'Sales Revenue',
      amount: amount,
      is_credit: true,
      description,
      reference_type: 'invoice',
      reference_id: invoiceId,
    });
  }

  static async getProfitLossReport() {
    return AccountingRepository.getAggregatedProfitLoss();
  }

  static async getGSTReport() {
    // Fetch all sent/paid invoices
    const b2bInvoices = await AccountingRepository.getInvoices({ type: 'b2b' });
    const b2cInvoices = await AccountingRepository.getInvoices({ type: 'b2c' });

    // eslint-disable-line @typescript-eslint/no-explicit-any
    const aggregateTax = (invoices: any[]) => {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      return invoices
        .filter((inv) => inv.status !== 'draft' && inv.status !== 'cancelled')
        .reduce((sum, inv) => sum + Number(inv.tax_total), 0);
    };
    // eslint-disable-line @typescript-eslint/no-explicit-any

    const aggregateSales = (invoices: any[]) => {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      return invoices
        .filter((inv) => inv.status !== 'draft' && inv.status !== 'cancelled')
        .reduce((sum, inv) => sum + Number(inv.subtotal), 0);
    };

    const b2bTax = aggregateTax(b2bInvoices);
    const b2cTax = aggregateTax(b2cInvoices);

    const b2bSales = aggregateSales(b2bInvoices);
    const b2cSales = aggregateSales(b2cInvoices);

    return {
      total_sales: b2bSales + b2cSales,
      total_tax_collected: b2bTax + b2cTax,
      breakdown: {
        b2b: { sales: b2bSales, tax: b2bTax, count: b2bInvoices.length },
        b2c: { sales: b2cSales, tax: b2cTax, count: b2cInvoices.length },
      },
    };
  }
}
