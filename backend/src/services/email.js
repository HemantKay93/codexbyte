import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendOrderConfirmation(order) {
  if (!resend) {
    console.log('RESEND_API_KEY not set. Email not sent:', order.id);
    return;
  }

  try {
    await resend.emails.send({
      from: 'ByteEvolvr <orders@byteevolvr.com>',
      to: order.customer_email,
      subject: `Order Confirmation - ${order.order_number}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your order <strong>${order.order_number}</strong> has been received.</p>
        <p>Total: ₹${order.total_amount}</p>
        <p>Shipping to: ${order.customer_name}</p>
      `
    });
    console.log('Confirmation email sent to:', order.customer_email);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
}

export async function sendPasswordResetEmail(email, link) {
  if (!resend) {
    console.log('RESEND_API_KEY not set. Reset email not sent to:', email);
    return;
  }

  try {
    await resend.emails.send({
      from: 'ByteEvolvr <auth@byteevolvr.com>',
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Reset your password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${link}">${link}</a>
      `
    });
  } catch (error) {
    console.error('Failed to send reset email:', error);
  }
}
