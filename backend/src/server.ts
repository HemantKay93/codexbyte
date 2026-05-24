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
import wishlistRoutes from './modules/wishlist/wishlist.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import shippingRoutes from './modules/shipping/shipping.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import userRoutes from './modules/user/user.routes.js';
import posRoutes from './modules/pos/pos.routes.js';
import marketingRoutes from './modules/marketing/marketing.routes.js';
import leadRoutes from './modules/lead/lead.routes.js';
import supportRoutes from './modules/support/support.routes.js';
import supplierRoutes from './modules/supplier/supplier.routes.js';
import whatsappRoutes from './modules/whatsapp/whatsapp.routes.js';

import * as reportController from './modules/admin/report.controller.js';
import { authenticate, authorize } from './middlewares/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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

// Request Logging
app.use(requestLogger);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000, // Increased from 200 to 5000 to allow for UI status polling
  message: 'Too many requests',
});
app.use('/api/', limiter);

// API Routes (V1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/shipping', shippingRoutes);
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
