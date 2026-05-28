import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import logger from './services/logger.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/error.js';
import { createServer } from 'http';
import { initSockets } from './sockets/index.js';
import './jobs/index.js'; // Initialize background workers
import { initializeWorkers } from './workers/index.js';
initializeWorkers();
import { initializeEventSubscribers } from './core/events/EventSubscriber.js';

// Initialize domain event listeners
initializeEventSubscribers();

// Route Imports
import productRoutes from './modules/product/product.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import orderRoutes from './modules/order/order.routes.js';
import reviewRoutes from './modules/review/review.routes.js';
import cmsRoutes from './modules/cms/cms.routes.js';
import webhookRoutes from './modules/webhooks/webhooks.routes.js';
import wishlistRoutes from './modules/wishlist/wishlist.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import shippingRoutes from './modules/shipping/shipping.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import userRoutes from './modules/user/user.routes.js';
import posRoutes from './modules/pos/pos.routes.js';
import marketingRoutes from './modules/marketing/marketing.routes.js';
import { accountingRoutes } from './modules/accounting/accounting.routes.js';
import leadRoutes from './modules/lead/lead.routes.js';
import supportRoutes from './modules/support/support.routes.js';
import supplierRoutes from './modules/supplier/supplier.routes.js';
import whatsappRoutes from './modules/whatsapp/whatsapp.routes.js';

import * as reportController from './modules/admin/report.controller.js';
import { authenticate, authorize } from './middlewares/auth.js';
import { validateEnvironment } from './config/env.js';
import { requestIdCorrelation } from './middlewares/requestId.js';
import { csrfProtection } from './middlewares/csrf.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Run startup environment variable validation
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 8080;

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: false,
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

      const envOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim());
      const allAllowed = [...allowedOrigins, ...envOrigins].filter(Boolean);

      if (!origin || allAllowed.includes(origin) || origin.startsWith('http://localhost:')) {
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
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours preflight cache
  })
);
app.use(express.json());

// Request ID Correlation & CSRF Protection
app.use(requestIdCorrelation);
app.use(csrfProtection);

// Request Logging
app.use(requestLogger);

// Rate Limiting Strategies
// 1. General API Limiter (Standard endpoints)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // 300 requests per 15 minutes
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Strict Auth / Bruteforce Protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 auth attempts per 15 minutes
  message: { message: 'Too many authentication attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. High Burst Webhook Ingestion Limiter
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // 1000 requests per 15 minutes to allow burst integrations
  message: { message: 'Webhook event ingestion limit exceeded.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Mount Routes with Specific Rate Limits
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/webhooks', webhookLimiter, webhookRoutes);

app.use('/api/v1/accounting', generalLimiter, accountingRoutes);
app.use('/api/v1/products', generalLimiter, productRoutes);
app.use('/api/v1/orders', generalLimiter, orderRoutes);
app.use('/api/v1/admin', generalLimiter, adminRoutes);
app.use('/api/v1/reviews', generalLimiter, reviewRoutes);
app.use('/api/v1/cms', generalLimiter, cmsRoutes);
app.use('/api/v1/wishlist', generalLimiter, wishlistRoutes);
app.use('/api/v1/payments', generalLimiter, paymentRoutes);
app.use('/api/v1/shipping', generalLimiter, shippingRoutes);
app.use('/api/v1/warehouse', inventoryRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/marketing', marketingRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/whatsapp', whatsappRoutes);
// Legacy compatibility
app.use('/api/leads', leadRoutes);

app.get(
  '/api/v1/reports/export',
  authenticate,
  authorize('admin', 'super-admin'),
  reportController.exportReport
);

// Health Check
app.get(['/health', '/api/health'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handling
app.use(errorHandler);

const httpServer = createServer(app);
initSockets(httpServer);

httpServer.listen(Number(PORT), '0.0.0.0', () => {
  logger.info(`🚀 Backend is LIVE!`);
  logger.info(`URL: http://0.0.0.0:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

export default app;
