import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import axios from 'axios';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import {
  buildCredentialError,
  getApiConfigSummary,
  hasCredentials,
} from './config.js';
import jwt from 'jsonwebtoken';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import bcrypt from 'bcryptjs';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import * as emailService from './services/email.js';
import logger from './services/logger.js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('CRITICAL: Missing Supabase configuration in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  logger.warn('WARNING: JWT_SECRET not set. Authentication will be insecure.');
}

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
if (!ADMIN_PASSWORD_HASH) {
  logger.warn('WARNING: ADMIN_PASSWORD_HASH not set. Admin login might fail or use insecure defaults.');
}
// Admin authenticated client generator for robust RLS bypassing
let cachedAdminToken = null;
let tokenExpiresAt = 0;

async function getAdminSupabase() {
  // If service role key is available, use it immediately as it's the most reliable way to bypass RLS
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });
  }

  if (!cachedAdminToken || Date.now() > tokenExpiresAt) {
    logger.info("Attempting to refresh Admin Supabase session...");
    const tempClient = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await tempClient.auth.signInWithPassword({ 
      email: 'admin@byteevolvr.com', 
      password: 'Admin@123' 
    });
    
    if (error || !data.session) {
      logger.error("CRITICAL: Admin Supabase login failed. Backend will attempt to use ANON key which may fail due to RLS.", error?.message);
      return supabase; // Fallback to anon
    }
    
    logger.info("Admin Supabase session refreshed successfully.");
    cachedAdminToken = data.session.access_token;
    tokenExpiresAt = Date.now() + (data.session.expires_in * 1000) - 60000;
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${cachedAdminToken}` } }
  });
}

const app = express();
const PORT = process.env.PORT || 8080;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else if (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.split(',').includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  logger.warn('WARNING: Razorpay keys not set. Payments will fail.');
}

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ByteEvolvr API',
      version: '1.0.0',
      description: 'API documentation for the ByteEvolvr e-commerce platform',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8080}`,
      },
    ],
  },
  apis: ['./src/server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ...getApiConfigSummary() });
});

// Auth Middleware
const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    console.warn('[Auth] No token provided');
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // 1. Try custom JWT verification first (fastest)
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.adminId = decoded.id;
      return next();
    } catch (e) {
      // Not a valid custom JWT, try Supabase
    }

    // 2. Try Supabase verification
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('[Auth] Supabase token verification failed:', error?.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // --- SELF-HEALING BLOCK FOR ADMIN ---
    try {
      const adminEmails = ['admin@byteevolvr.com', 'hemant.k@byteevolvr.com'];
      if (adminEmails.includes(user.email)) {
        req.adminId = user.id;
        
        // Use admin client to check/promote (bypasses RLS)
        const adminSupabase = await getAdminSupabase();
        const { data: existingProfile } = await adminSupabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (!existingProfile || existingProfile.role !== 'admin') {
          console.log(`[Auth] Promoting ${user.email} to admin role...`);
          await adminSupabase
            .from('user_profiles')
            .upsert({ 
              id: user.id, 
              email: user.email, 
              role: 'admin',
              full_name: user.user_metadata?.full_name || 'System Admin'
            });
        }
        
        return next();
      }
    } catch (e) {
      console.error('[Auth] Self-healing error:', e.message);
    }
    // ------------------------------------

    // 3. Regular check for other admin users
    // Use admin client here too just in case RLS is blocking the anon key
    const adminSupabase = await getAdminSupabase();
    const { data: profile, error: profileError } = await adminSupabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      console.warn('[Auth] Unauthorized access attempt by user:', user.email);
      return res.status(403).json({ message: 'Administrative access required' });
    }

    req.adminId = user.id;
    next();
  } catch (error) {
    console.error('[Auth] Critical auth error:', error.message);
    res.status(500).json({ message: 'Authentication system error' });
  }
};

// Auth Endpoints
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. Check hardcoded admin (Super Admin)
  if (email === 'admin@byteevolvr.com' && ADMIN_PASSWORD_HASH && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    const token = jwt.sign({ id: 'admin', email, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token, user: { id: 'admin', email, full_name: 'Main Admin', role: 'admin' } });
  }

  // 2. Check Supabase for other admins
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single();

    if (profile?.role !== 'admin' && email !== 'hemant.k@byteevolvr.com') {
      return res.status(403).json({ message: 'Administrative access required' });
    }

    res.json({ 
      token: data.session.access_token, 
      user: { 
        id: data.user.id, 
        email: data.user.email, 
        full_name: profile?.full_name || data.user.user_metadata?.full_name,
        role: 'admin'
      } 
    });
  } catch (err) {
    res.status(401).json({ message: err.message || 'Invalid credentials' });
  }
});

// Customer Auth Middleware
const authenticateCustomer = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.user = user;
  next();
};

app.post('/api/auth/customer/signup', async (req, res) => {
  const { email, password, name } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });

  if (error) return res.status(400).json({ message: error.message });
  res.json({ user: data.user, session: data.session });
});

app.post('/api/auth/customer/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return res.status(401).json({ message: error.message });
  res.json({ token: data.session.access_token, user: data.user });
});

app.post('/api/auth/customer/forgot-password', async (req, res) => {
  const { email } = req.body;
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) return res.status(400).json({ message: error.message });
  
  // Supabase sends its own email if configured, but we can also trigger ours if we want
  // await emailService.sendPasswordResetEmail(email, `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`);
  
  res.json({ message: 'Password reset link sent to your email' });
});

app.get('/api/customer/me', authenticateCustomer, async (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/orders/me', authenticateCustomer, async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Failed to fetch orders from Supabase:', error);
    return res.json({ orders: [] }); // Fallback if table doesn't exist
  }
  res.json({ orders: data || [] });
});

// Products API
app.get('/api/products', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.get('/api/products/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ message: 'Product not found' });
  res.json(data);
});

app.post('/api/products', authenticateAdmin, async (req, res) => {
  const adminClient = await getAdminSupabase();
  const { data, error } = await adminClient
    .from('products')
    .insert([req.body])
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

app.put('/api/products/:id', authenticateAdmin, async (req, res) => {
  const adminClient = await getAdminSupabase();
  const { data, error } = await adminClient
    .from('products')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
  const adminClient = await getAdminSupabase();
  const { error } = await adminClient
    .from('products')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(400).json({ message: error.message });
  res.status(204).send();
});

app.get('/api/auth/verify', authenticateAdmin, (req, res) => {
  res.json({ valid: true, adminId: req.adminId });
});

app.post('/api/payments/razorpay/order', async (req, res) => {
  if (!hasCredentials('razorpay')) {
    return res.status(503).json(buildCredentialError('razorpay'));
  }

  try {
    const { amount, receipt } = req.body;
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt,
    });

    res.json({
      provider: 'razorpay',
      key: process.env.RAZORPAY_KEY_ID,
      order: razorpayOrder,
    });
  } catch (error) {
    res.status(502).json({
      message: 'Failed to create Razorpay order',
      details: error?.error?.description || error?.message || 'Unknown payment gateway error',
    });
  }
});

app.post('/api/shipping/rates', async (req, res) => {
  if (!hasCredentials('shiprocket')) {
    // Return mock rates if credentials are missing
    return res.json({
      rates: [
        { courier_name: 'Delhivery', rate: 40, estimated_delivery_days: 3 },
        { courier_name: 'BlueDart', rate: 90, estimated_delivery_days: 2 },
        { courier_name: 'Ecom Express', rate: 35, estimated_delivery_days: 5 },
      ]
    });
  }

  try {
    const tokenResponse = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    const ratesResponse = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/`,
      {
        params: req.query,
        headers: {
          Authorization: `Bearer ${tokenResponse.data.token}`,
        },
      }
    );

    res.json(ratesResponse.data);
  } catch (error) {
    res.status(502).json({
      message: 'Failed to fetch Shiprocket rates',
      details: error?.response?.data?.message || error?.message || 'Unknown shipping provider error',
    });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod, userId } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // Use requester's token if available for RLS compliance, otherwise fall back to admin
    const client = token 
      ? createClient(supabaseUrl, supabaseKey, { global: { headers: { Authorization: `Bearer ${token}` } } })
      : await getAdminSupabase();

    // Calculate GST (18%)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const calculatedGst = Math.round(subtotal * 0.18);
    const orderNumber = `ORD-${Date.now()}`;

    const order = {
      id: `order_${Date.now()}`,
      status: 'pending',
      trackingId: `TRK-${Math.random().toString(36).substring(7).toUpperCase()}`,
      subtotal,
      gst: calculatedGst,
      totalAmount,
      shippingAddress,
      paymentMethod,
      items,
      createdAt: new Date().toISOString(),
    };

    if (userId) {
      // 1. Try to save the address
      const { data: dbAddress, error: addressError } = await client.from('addresses').insert({
        user_id: userId,
        full_name: shippingAddress.name || 'Customer',
        phone: shippingAddress.phone || '',
        line_1: shippingAddress.address1 || '',
        line_2: shippingAddress.address2 || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        postal_code: shippingAddress.pincode || '',
        address_type: 'home'
      }).select().single();

      if (addressError) logger.error('Address insert error:', addressError);

      // 2. Fetch user email if not provided
      let customerEmail = shippingAddress.email;
      if (!customerEmail && userId) {
        const { data: profile } = await client.from('user_profiles').select('email').eq('id', userId).maybeSingle();
        customerEmail = profile?.email;
      }

      // 3. Save the order to Supabase
      const { data: dbOrder, error: orderError } = await client.from('orders').insert({
        user_id: userId,
        order_number: orderNumber,
        status: 'pending',
        payment_status: paymentMethod === 'razorpay' ? 'paid' : 'pending',
        shipping_address_id: dbAddress ? dbAddress.id : null,
        subtotal,
        tax_amount: calculatedGst,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        notes: '',
        customer_name: shippingAddress.name || 'Customer',
        customer_email: customerEmail || ''
      }).select().single();

      if (!orderError && dbOrder) {
        const orderItems = items.map(item => ({
          order_id: dbOrder.id,
          product_id: item.productId,
          product_name: item.name || 'Product',
          sku: item.sku || 'SKU',
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        }));

        await client.from('order_items').insert(orderItems);
        order.id = dbOrder.id;
      } else {
        logger.error('Supabase order insert error:', orderError);
        throw orderError; // Throw to be caught by catch block
      }
    }

    // Send confirmation email
    if (order.customer_email) {
      emailService.sendOrderConfirmation(order);
    }

    // Inventory Alerts check
    try {
      const lowStockItems = [];
      for (const item of items) {
        const { data: prod } = await client.from('products').select('stock_quantity, name').eq('id', item.productId).single();
        if (prod && prod.stock_quantity <= 5) {
          lowStockItems.push(prod.name);
        }
      }
      if (lowStockItems.length > 0) {
        logger.warn(`LOW STOCK ALERT: The following items are running low: ${lowStockItems.join(', ')}`);
        // In a real app, send an email to admin here
      }
    } catch (invErr) {
      logger.error('Inventory check failed:', invErr);
    }

    res.json({ order });
  } catch (error) {
    res.status(502).json({
      message: 'Failed to create order',
      details: error.message,
    });
  }
});

app.get('/api/tracking/:trackingId', async (req, res) => {
  const { trackingId } = req.params;

  if (!hasCredentials('shiprocket')) {
    // Fallback to mock for development if no keys
    return res.json({
      trackingId,
      courierName: 'Delhivery (Mock)',
      status: 'In Transit',
      events: [
        { status: 'Shipment Created', timestamp: new Date().toISOString() }
      ]
    });
  }

  try {
    const tokenResponse = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    const trackingResponse = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${trackingId}`,
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.token}`,
        },
      }
    );

    res.json(trackingResponse.data);
  } catch (error) {
    res.status(502).json({
      message: 'Failed to fetch tracking data',
      details: error?.response?.data?.message || error?.message
    });
  }
});

// Admin Orders API
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const adminSupabase = await getAdminSupabase();
    const { data: orders, error } = await adminSupabase
      .from('orders')
      .select('*, order_items(*), shipments(tracking_id, courier_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(orders);
  } catch (error) {
    logger.error('Admin orders route error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

app.get('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const adminSupabase = await getAdminSupabase();
    const { data: order, error } = await adminSupabase
      .from('orders')
      .select('*, order_items(*), shipments(tracking_id, courier_name), addresses(*)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(order);
  } catch (error) {
    logger.error('Admin order detail error:', error);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
});

app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  console.log('[Backend] Received request for /api/admin/stats');
  try {
    const adminSupabase = await getAdminSupabase();
    const { data: orders, error: ordersError } = await adminSupabase.from('orders').select('total_amount, created_at');
    console.log('[Backend] Supabase orders fetched:', orders?.length);
    
    const { count: customers, error: customersError } = await adminSupabase.from('user_profiles').select('*', { count: 'exact', head: true });
    console.log('[Backend] Supabase customers count fetched:', customers);

    if (ordersError || customersError) throw ordersError || customersError;

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const salesCount = orders.length;
    
    res.json({
      totalRevenue,
      salesCount,
      customerCount: customers || 0,
      avgOrderValue: salesCount > 0 ? totalRevenue / salesCount : 0
    });
  } catch (error) {
    logger.error('Admin stats route error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

app.get('/api/admin/customers', authenticateAdmin, async (req, res) => {
  try {
    const adminSupabase = await getAdminSupabase();
    const { data: profiles, error: profilesError } = await adminSupabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    const { data: orders, error: ordersError } = await adminSupabase
      .from('orders')
      .select('user_id, total_amount');

    if (ordersError) throw ordersError;

    const customersWithStats = profiles.map(profile => {
      const userOrders = orders.filter(o => o.user_id === profile.id);
      const totalSpent = userOrders.reduce((acc, o) => acc + Number(o.total_amount), 0);
      
      return {
        ...profile,
        orderCount: userOrders.length,
        totalSpent: totalSpent
      };
    });

    res.json(customersWithStats);
  } catch (error) {
    logger.error('Admin customers route error:', error);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

app.get('/api/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const adminSupabase = await getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Admin get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

app.get('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const adminSupabase = await getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Admin get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

app.post('/api/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const adminSupabase = await getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('products')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    logger.error('Admin create product error:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

app.put('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const adminSupabase = await getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('products')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Admin update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

app.delete('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const adminSupabase = await getAdminSupabase();
    const { error } = await adminSupabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    logger.error('Admin delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

app.put('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, courier, trackingId } = req.body;

    // Convert display status back to DB enum
    const dbStatus = status ? status.toLowerCase() : undefined;

    // Update order status
    if (dbStatus) {
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: dbStatus })
        .eq('id', id);

      if (orderError) throw orderError;
    }

    // Update or insert shipment info
    if (courier || trackingId) {
      // First check if shipment exists
      const { data: existingShipment } = await supabase
        .from('shipments')
        .select('id')
        .eq('order_id', id)
        .single();

      if (existingShipment) {
        await supabase
          .from('shipments')
          .update({
            courier_name: courier,
            tracking_id: trackingId,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingShipment.id);
      } else {
        await supabase
          .from('shipments')
          .insert({
            order_id: id,
            courier_name: courier || '',
            tracking_id: trackingId || ''
          });
      }
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Update order error:', error);
    res.status(500).json({ message: 'Failed to update order' });
  }
});

app.post('/api/payments/verify', (req, res) => {
  if (!hasCredentials('razorpay')) {
    return res.status(503).json(buildCredentialError('razorpay'));
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  res.json({ verified: expectedSignature === razorpay_signature });
});

app.post('/api/shipping/shiprocket', async (req, res) => {
  if (!hasCredentials('shiprocket')) {
    return res.status(503).json(buildCredentialError('shiprocket'));
  }

  try {
    const tokenResponse = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    const shipmentResponse = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      req.body,
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.token}`,
        },
      }
    );

    res.json(shipmentResponse.data);
  } catch (error) {
    res.status(502).json({
      message: 'Failed to create Shiprocket shipment',
      details: error?.response?.data?.message || error?.message || 'Unknown shipping provider error',
    });
  }
});

app.post('/api/leads', (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required.' });
  }

  // In a real app, save to DB or send email/CRM
  console.log('New Lead Captured:', { name, email, phone, subject, message, timestamp: new Date() });

  res.status(201).json({
    message: 'Enquiry received successfully! Our team will contact you soon.',
    id: `lead_${Date.now()}`
  });
});

// Reports & Export Endpoints
app.get('/api/reports/export', authenticateAdmin, (req, res) => {
  const { type, format } = req.query; // daily, monthly, shipment | csv, excel

  // Mock data for export
  const data = [
    { id: 1, date: '2026-04-20', revenue: 50000, orders: 12, status: 'Completed' },
    { id: 2, date: '2026-04-21', revenue: 75000, orders: 18, status: 'Completed' },
    { id: 3, date: '2026-04-22', revenue: 42000, orders: 9, status: 'Completed' },
  ];

  if (format === 'excel') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report_${type}_${Date.now()}.xlsx`);
    return res.send(buffer);
  } else {
    const parser = new Parser();
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report_${type}_${Date.now()}.csv`);
    return res.send(csv);
  }
});

// Wishlist Endpoints
app.get('/api/wishlist', authenticateCustomer, async (req, res) => {
  const { data, error } = await supabase
    .from('wishlists')
    .select('*, products(*)')
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.post('/api/wishlist', authenticateCustomer, async (req, res) => {
  const { productId } = req.body;
  const { data, error } = await supabase
    .from('wishlists')
    .insert([{ user_id: req.user.id, product_id: productId }])
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

app.delete('/api/wishlist/:productId', authenticateCustomer, async (req, res) => {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', req.user.id)
    .eq('product_id', req.params.productId);

  if (error) return res.status(400).json({ message: error.message });
  res.status(204).send();
});

// Reviews Endpoints
app.get('/api/products/:id/reviews', async (req, res) => {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*, user_profiles(name)')
    .eq('product_id', req.params.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.post('/api/products/:id/reviews', authenticateCustomer, async (req, res) => {
  const { rating, comment } = req.body;
  const { data, error } = await supabase
    .from('product_reviews')
    .insert([{
      product_id: req.params.id,
      user_id: req.user.id,
      rating,
      comment,
      status: 'pending' // Admin must approve
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Ensure Admin Profiles exist
const seedAdminProfiles = async () => {
  try {
    const adminEmails = ['admin@byteevolvr.com', 'hemant.k@byteevolvr.com'];
    logger.info(`[Seed] Ensuring admin profiles exist for: ${adminEmails.join(', ')}`);
    
    // Use admin client to bypass RLS
    const adminSupabase = await getAdminSupabase();
    const { data: profiles, error: fetchError } = await adminSupabase
      .from('user_profiles')
      .select('id, email')
      .in('email', adminEmails);
    
    if (fetchError) {
      logger.error(`[Seed] Failed to fetch existing profiles: ${fetchError.message}`);
      return;
    }

    // For each admin email, if they are already in user_profiles, ensure they have the admin role
    for (const email of adminEmails) {
      const profile = profiles.find(p => p.email === email);
      if (profile) {
        const { error: updateError } = await adminSupabase
          .from('user_profiles')
          .update({ role: 'admin' })
          .eq('id', profile.id);
        
        if (updateError) {
          logger.error(`[Seed] Failed to update role for ${email}: ${updateError.message}`);
        } else {
          logger.info(`[Seed] Verified admin role for: ${email}`);
        }
      } else {
        logger.warn(`[Seed] User ${email} not found in user_profiles yet. They will be auto-promoted upon their first login.`);
      }
    }
  } catch (error) {
    logger.error(`[Seed] Critical seeding error: ${error.message}`);
  }
};

// CMS Routes
app.get('/api/cms/:pageSlug', async (req, res) => {
  try {
    const { pageSlug } = req.params;
    const { sectionKeys } = req.query;
    
    let query = supabase
      .from('cms_content')
      .select('*')
      .eq('page_slug', pageSlug);
    
    if (sectionKeys) {
      query = query.in('section_key', sectionKeys.split(','));
    }
    
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('CMS fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch CMS content' });
  }
});

app.put('/api/admin/cms/:pageSlug/:sectionKey', authenticateAdmin, async (req, res) => {
  try {
    const { pageSlug, sectionKey } = req.params;
    const { content } = req.body;
    
    const adminSupabase = await getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('cms_content')
      .upsert({ 
        page_slug: pageSlug, 
        section_key: sectionKey, 
        content,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('CMS update error:', error);
    res.status(500).json({ message: 'Failed to update CMS content' });
  }
});

// Admin Review Routes
app.get('/api/admin/reviews', authenticateAdmin, async (req, res) => {
  try {
    const adminSupabase = await getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('product_reviews')
      .select(`
        *,
        product:product_id (name),
        user:user_id (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Admin reviews fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

app.put('/api/admin/reviews/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const adminSupabase = await getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('product_reviews')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Admin review update error:', error);
    res.status(500).json({ message: 'Failed to update review status' });
  }
});

// Wishlist Routes
app.get('/api/wishlist', authenticateCustomer, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*, product:products(*)')
      .eq('user_id', req.user.id);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Wishlist fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
});

app.post('/api/wishlist/:productId/toggle', authenticateCustomer, async (req, res) => {
  try {
    const { productId } = req.params;
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', productId)
      .maybeSingle();
    
    if (existing) {
      await supabase.from('wishlists').delete().eq('id', existing.id);
      res.json({ isWishlisted: false });
    } else {
      await supabase.from('wishlists').insert({ user_id: req.user.id, product_id: productId });
      res.json({ isWishlisted: true });
    }
  } catch (error) {
    logger.error('Wishlist toggle error:', error);
    res.status(500).json({ message: 'Failed to toggle wishlist' });
  }
});

app.get('/api/wishlist/:productId/check', authenticateCustomer, async (req, res) => {
  try {
    const { productId } = req.params;
    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', productId)
      .maybeSingle();
    
    res.json({ isWishlisted: !!data });
  } catch (error) {
    res.json({ isWishlisted: false });
  }
});

// Start Server
app.listen(PORT, async () => {
  logger.info(`API server listening on port ${PORT}`);
  
  // Seed admins on startup
  try {
    await seedAdminProfiles();
  } catch (err) {
    logger.error(`Seed failed: ${err.message}`);
  }
});
