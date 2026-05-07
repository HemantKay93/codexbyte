import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import logger from './services/logger.js';
import { errorHandler } from './middlewares/error.js';

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

import * as reportController from './controllers/reportController.js';
import { authenticate, authorize } from './middlewares/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 8080;

// Security Middlewares
app.use(helmet());
app.use(cors());
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

// Placeholder routes for secondary modules
app.get('/api/admin/discounts', (req, res) => res.json([]));
app.get('/api/admin/support/tickets', (req, res) => res.json([]));
app.get('/api/admin/team', (req, res) => res.json([]));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

export default app;
