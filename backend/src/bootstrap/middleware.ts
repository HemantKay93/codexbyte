import { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import express from 'express';
import hpp from 'hpp';

import logger from '../services/logger.js';
import { requestIdCorrelation } from '../middlewares/requestId.js';
import { requestLogger } from '../middlewares/requestLogger.js';
import { env } from '../config/env.js';

export function bootstrapMiddleware(app: Express) {
  app.set('trust proxy', 1);

  // Security Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Support frontend integrations
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'https://*'], // Relaxed to support external product images
          connectSrc: ["'self'", 'https://*'], // Allowed for external APIs
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
      frameguard: {
        action: 'deny',
      },
      xContentTypeOptions: true,
    })
  );

  app.use(
    cors({
      origin: function (origin, callback) {
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:5174',
          'http://127.0.0.1:5173',
          'http://localhost:4031',
          'http://127.0.0.1:4031',
          'https://codexbyte-admin.vercel.app',
          'https://codexbyte-frontend.vercel.app',
          'https://codexbyte.vercel.app',
          'https://byteevolvr.vercel.app',
          'https://admin.byteevolvr.com',
          'https://shop.byteevolvr.com',
        ];

        const envOrigins = (env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim());
        const allAllowed = [...allowedOrigins, ...envOrigins].filter(Boolean);

        const isDev = env.NODE_ENV !== 'production';
        const isLocalNetwork =
          isDev &&
          origin &&
          (origin.startsWith('http://localhost:') ||
            origin.startsWith('http://127.0.0.1:') ||
            origin.startsWith('http://192.168.') ||
            origin.startsWith('http://10.') ||
            origin.startsWith('http://172.'));

        if (!origin || allAllowed.includes(origin) || isLocalNetwork) {
          callback(null, true);
        } else {
          logger.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-Trace-Id',
        'X-Correlation-Id',
        'X-Tenant-Id',
      ],
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
      maxAge: 86400, // 24 hours preflight cache
    })
  );

  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf.toString();
      },
    })
  );

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // Request ID Correlation
  app.use(requestIdCorrelation);

  // Request Logging
  app.use(requestLogger);
}

export function createRateLimiters() {
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { message: 'Too many authentication attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const webhookLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { message: 'Webhook event ingestion limit exceeded.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  return { generalLimiter, authLimiter, webhookLimiter };
}
