import crypto from 'node:crypto';

import logger from '../services/logger.js';

export class SecurityLogger {
  static logSecurityEvent(event: string, meta: Record<string, any> = {}) {
    const requestId = crypto.randomUUID();
    logger.warn(`[SECURITY] ${event}`, {
      ...meta,
      requestId,
      securityEvent: true,
      timestamp: new Date().toISOString(),
    });
  }

  static logFailedLogin(email: string, ip: string, reason: string) {
    this.logSecurityEvent('Failed Login Attempt', { email, ip, reason });
  }

  static logWebhookSignatureFailure(provider: string, ip: string) {
    this.logSecurityEvent('Webhook Signature Validation Failed', { provider, ip });
  }

  static logUnauthorizedAccess(endpoint: string, ip: string, userId?: string) {
    this.logSecurityEvent('Unauthorized Access Attempt', { endpoint, ip, userId });
  }
}
