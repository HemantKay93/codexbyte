import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { Order, OrderItem } from '../types/index.js';

export class PdfService {
  /**
   * Generates a professional tax invoice PDF for an order
   */
  static async generateInvoice(order: any, res: Response) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Stream the PDF to the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.order_number}.pdf`);
    doc.pipe(res);

    // --- Header ---
    doc.fillColor('#3b82f6').fontSize(24).text('ByteEvolvr', 50, 50);
    doc.fillColor('#444444').fontSize(10).text('101, Tech Park, Andheri East', 50, 80);
    doc.text('Mumbai, MH 400069', 50, 95);
    doc.text('Phone: +91 99999 88888', 50, 110);
    doc.text('GSTIN: 27AABCB1234F1Z5', 50, 125);

    doc.fillColor('#000000').fontSize(20).text('TAX INVOICE', 400, 50, { align: 'right' });
    doc.fontSize(10).text(`Invoice #: ${order.order_number}`, 400, 80, { align: 'right' });
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 400, 95, { align: 'right' });

    doc.moveTo(50, 150).lineTo(550, 150).stroke();

    // --- Addresses ---
    doc.fontSize(12).font('Helvetica-Bold').text('Billed To:', 50, 170);
    doc.fontSize(10).font('Helvetica').text(order.customer_name || 'Walk-in Customer', 50, 185);
    doc.text(order.customer_email || '', 50, 200);

    const shipping = order.addresses?.[0] || order.addresses;
    if (shipping) {
      doc.fontSize(12).font('Helvetica-Bold').text('Ship To:', 300, 170);
      doc.fontSize(10).font('Helvetica').text(shipping.full_name, 300, 185);
      doc.text(`${shipping.line_1}, ${shipping.line_2 || ''}`, 300, 200);
      doc.text(`${shipping.city}, ${shipping.state} - ${shipping.postal_code}`, 300, 215);
    }

    doc.moveTo(50, 250).lineTo(550, 250).stroke();

    // --- Table Header ---
    let y = 270;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Description', 50, y);
    doc.text('SKU', 250, y);
    doc.text('Qty', 350, y, { width: 50, align: 'right' });
    doc.text('Price', 400, y, { width: 70, align: 'right' });
    doc.text('Total', 480, y, { width: 70, align: 'right' });

    doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
    y += 25;

    // --- Table Rows ---
    doc.font('Helvetica');
    const items = order.order_items || [];
    items.forEach((item: any) => {
      doc.text(item.product_name, 50, y);
      doc.text(item.sku, 250, y);
      doc.text(item.quantity.toString(), 350, y, { width: 50, align: 'right' });
      doc.text(`Rs ${Number(item.unit_price).toFixed(2)}`, 400, y, { width: 70, align: 'right' });
      doc.text(`Rs ${Number(item.total_price).toFixed(2)}`, 480, y, { width: 70, align: 'right' });
      y += 20;

      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });

    // --- Totals ---
    y += 20;
    doc.moveTo(350, y).lineTo(550, y).stroke();
    y += 10;

    doc.text('Subtotal:', 350, y, { width: 100, align: 'right' });
    doc.text(`Rs ${Number(order.subtotal || order.total_amount * 0.82).toFixed(2)}`, 450, y, { width: 100, align: 'right' });
    y += 15;

    doc.text('Tax (GST 18%):', 350, y, { width: 100, align: 'right' });
    doc.text(`Rs ${Number(order.tax_amount).toFixed(2)}`, 450, y, { width: 100, align: 'right' });
    y += 20;

    doc.fontSize(14).font('Helvetica-Bold');
    doc.fillColor('#3b82f6').text('Total:', 350, y, { width: 100, align: 'right' });
    doc.text(`Rs ${Number(order.total_amount).toFixed(2)}`, 450, y, { width: 100, align: 'right' });

    // --- Footer ---
    doc.fillColor('#999999').fontSize(8).font('Helvetica').text(
      'This is a computer generated document. Terms: 1. Goods once sold will not be taken back. 2. Subject to Mumbai Jurisdiction.',
      50, 780, { align: 'center' }
    );

    doc.end();
  }
}
