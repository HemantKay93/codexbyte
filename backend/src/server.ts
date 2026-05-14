import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import logger from './services/logger.js';
import { errorHandler } from './middlewares/error.js';
import { createServer } from 'http';
import { initSockets } from './sockets/index.js';
import './jobs/index.js'; // Initialize background workers

// Route Imports
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import warehouseRoutes from './routes/warehouseRoutes.js';
import userRoutes from './routes/userRoutes.js';
import posRoutes from './routes/posRoutes.js';
import marketingRoutes from './routes/marketingRoutes.js';

import * as reportController from './controllers/reportController.js';
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
        'https://codexbyte-admin.vercel.app',
        'https://codexbyte.vercel.app',
        'https://byteevolvr.vercel.app',
      ];

      const envOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim());
      const allAllowed = [...allowedOrigins, ...envOrigins].filter(Boolean);

      if (!origin || allAllowed.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours preflight cache
  })
);
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
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
app.use('/api/v1/warehouse', warehouseRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/marketing', marketingRoutes);

app.get(
  '/api/v1/reports/export',
  authenticate,
  authorize('admin', 'super-admin'),
  reportController.exportReport
);

// Legacy Routes (for frontend compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/warehouse', warehouseRoutes);

app.get(
  '/api/reports/export',
  authenticate,
  authorize('admin', 'super-admin'),
  reportController.exportReport
);

// Additional Legacy Mappings
app.get('/api/products/:productId/reviews', reviewRoutes);
app.post('/api/products/:productId/reviews', reviewRoutes);
app.get('/api/tracking/:trackingId', shippingRoutes);

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

export default app;
