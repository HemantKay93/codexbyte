import crypto from 'crypto';

export class CryptoUtils {
  /**
   * Safely compares two strings or buffers using constant-time comparison
   * to prevent timing attacks.
   */
  static constantTimeCompare(a: string | Buffer, b: string | Buffer): boolean {
    const aBuf = Buffer.isBuffer(a) ? a : Buffer.from(a, 'utf-8');
    const bBuf = Buffer.isBuffer(b) ? b : Buffer.from(b, 'utf-8');

    if (aBuf.length !== bBuf.length) {
      // Avoid leaking length differences by comparing the first buffer to itself
      crypto.timingSafeEqual(aBuf, aBuf);
      return false;
    }

    return crypto.timingSafeEqual(aBuf, bBuf);
  }

  /**
   * Verifies a signature using HMAC SHA256.
   */
  static verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    return this.constantTimeCompare(expectedSignature, signature);
  }
}
