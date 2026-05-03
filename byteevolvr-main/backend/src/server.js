import 'dotenv/config';
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
import bcrypt from 'bcryptjs';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wpxotvohmipetlgsontl.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_EF3D7K34ABwiZ5FYTCkcdQ_TctzRbwJ';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'byteevolvr_super_secret_key';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin123', 10);

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
    console.log("Attempting to refresh Admin Supabase session...");
    const tempClient = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await tempClient.auth.signInWithPassword({ 
      email: 'admin@byteevolvr.com', 
      password: 'Admin@123' 
    });
    
    if (error || !data.session) {
      console.error("CRITICAL: Admin Supabase login failed. Backend will attempt to use ANON key which may fail due to RLS.", error?.message);
      return supabase; // Fallback to anon
    }
    
    console.log("Admin Supabase session refreshed successfully.");
    cachedAdminToken = data.session.access_token;
    tokenExpiresAt = Date.now() + (data.session.expires_in * 1000) - 60000;
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${cachedAdminToken}` } }
  });
}

const app = express();

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
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ...getApiConfigSummary() });
});

// Auth Middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Auth Endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@byteevolvr.com' && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    const token = jwt.sign({ id: 'admin', email }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token, admin: { email, name: 'Main Admin' } });
  }

  res.status(401).json({ message: 'Invalid credentials' });
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
    console.error('Failed to fetch orders from Supabase:', error);
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

      if (addressError) console.error('Address insert error:', addressError);

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
        console.error('Supabase order insert error:', orderError);
        throw orderError; // Throw to be caught by catch block
      }
    }

    res.json({ order });
  } catch (error) {
    res.status(502).json({
      message: 'Failed to create order',
      details: error.message,
    });
  }
});

// Admin Orders API
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*), shipments(tracking_id, courier_name), addresses(full_name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch admin orders:', error);
      return res.status(500).json({ message: 'Failed to fetch orders' });
    }

    // Map data to match frontend expectations
    const formattedOrders = orders.map(order => {
      const itemsCount = order.order_items ? order.order_items.reduce((sum, item) => sum + item.quantity, 0) : 0;
      const shipment = order.shipments && Array.isArray(order.shipments) && order.shipments.length > 0
        ? order.shipments[0]
        : (order.shipments || null);

      const customerName = order.addresses
        ? (Array.isArray(order.addresses) ? order.addresses[0]?.full_name : order.addresses.full_name)
        : 'Customer';

      return {
        id: order.id,
        orderNumber: order.order_number,
        customer: customerName || 'Customer',
        amount: `₹${order.total_amount}`,
        status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
        courier: shipment?.courier_name || 'Unassigned',
        trackingId: shipment?.tracking_id || '-',
        items: itemsCount
      };
    });

    res.json(formattedOrders);
  } catch (error) {
    console.error('Admin orders route error:', error);
    res.status(500).json({ message: 'Server error' });
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
    console.error('Update order error:', error);
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

app.get('/api/tracking/:trackingId', (req, res) => {
  res.json({
    trackingId: req.params.trackingId,
    courierName: 'Delhivery',
    status: 'In Transit',
    events: [
      {
        status: 'Shipment Created',
        description: 'Order synced with shipping partner',
        timestamp: '2026-04-25 10:20 IST',
      },
      {
        status: 'Picked Up',
        description: 'Package collected from warehouse',
        timestamp: '2026-04-26 09:40 IST',
      },
      {
        status: 'In Transit',
        description: 'Shipment moving to destination hub',
        timestamp: '2026-04-27 07:10 IST',
      },
    ],
  });
});

app.listen(process.env.PORT || 8080, () => {
  const summary = getApiConfigSummary();
  console.log(`API server listening on port ${summary.port}`);
  console.log(
    `Provider status: Razorpay=${summary.providers.razorpayConfigured ? 'configured' : 'missing'} Shiprocket=${summary.providers.shiprocketConfigured ? 'configured' : 'missing'}`
  );
});
