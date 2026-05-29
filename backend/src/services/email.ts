import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export class EmailService {
  static async sendEmail(to: string, subject: string, html: string) {
    if (!resend) {
      console.log('RESEND_API_KEY not set. Email not sent to:', to);
      // eslint-disable-line no-console
      return;
    }
    await resend.emails.send({
      from: 'ByteEvolvr <noreply@byteevolvr.com>',
      to,
      subject,
      html,
    });
  }

  static async sendOrderConfirmation(order: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-line @typescript-eslint/no-explicit-any
    await this.sendEmail(
      order.customer_email,
      `Order Confirmation - ${order.order_number}`,
      `
        <h1>Thank you for your order!</h1>
        <p>Your order <strong>${order.order_number}</strong> has been received.</p>
        <p>Total: ₹${order.total_amount}</p>
        <p>Shipping to: ${order.customer_name}</p>
      `
    );
  }

  static async sendPasswordResetEmail(email: string, link: string) {
    await this.sendEmail(
      email,
      'Reset your password',
      `
        <h1>Reset your password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${link}">${link}</a>
      `
    );
  }
}
