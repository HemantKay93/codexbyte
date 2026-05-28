import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import logger from '../services/logger.js';

const parseCookies = (cookieHeader?: string): Record<string, string> => {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((item) => {
    const parts = item.split('=');
    const name = parts[0]?.trim();
    if (name) {
      cookies[name] = parts.slice(1).join('=').trim();
    }
  });
  return cookies;
};

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  const method = req.method;

  // 1. Skip validation if using standard Bearer authorization header (inherently immune to CSRF)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next();
  }

  // 2. Skip validation for read-only safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(method)) {
    // Inject CSRF cookie if not present
    const parsedCookies = parseCookies(req.headers.cookie);
    if (!parsedCookies['XSRF-TOKEN']) {
      const csrfToken = crypto.randomBytes(24).toString('hex');
      res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false, // Must be readable by client-side frontend to send back in header
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }
    return next();
  }

  // 2. Bypass CSRF validation for authentication endpoints (admin + customer login/register)
  const authBypassPaths = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/customer/login',
    '/api/v1/auth/customer/register',
    '/api/v1/auth/customer/signup',
  ];
  if (authBypassPaths.includes(req.path) && method === 'POST') {
    // Ensure a CSRF cookie is set for future requests
    const parsedCookies = parseCookies(req.headers.cookie);
    if (!parsedCookies['XSRF-TOKEN']) {
      const csrfToken = crypto.randomBytes(24).toString('hex');
      res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }
    return next();
  }

  // 3. Perform Double-Submit Cookie CSRF Validation on other state-changing methods
  const parsedCookies = parseCookies(req.headers.cookie);
  const cookieToken = parsedCookies['XSRF-TOKEN'];
  const headerToken = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    logger.warn(`[CSRF] Blocked potential CSRF attack on ${req.method} ${req.path}`);
    return res.status(403).json({
      status: 'error',
      message: 'CSRF token validation failed.',
    });
  }

  next();
};
