import { Response } from 'express';

import { AuthRequest } from '../../middlewares/auth.js';
import { catchAsync, AppError } from '../../middlewares/error.js';
import { OrderService } from '../order/order.service.js';
import { InventoryService } from '../inventory/inventory.service.js';
// eslint-disable-line @typescript-eslint/no-unused-vars
// eslint-disable-line @typescript-eslint/no-unused-vars
import { AuditService } from '../../services/auditService.js';
import { getAdminClient } from '../../config/supabase.js';

const orderService = new OrderService();

// eslint-disable-line @typescript-eslint/no-explicit-any
const resolvePosInventory = async (admin: any, product: any, warehouseId: string) => {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: inv, error: invError } = await admin
    .from('inventory')
    .select('id, quantity')
    .eq('product_id', product.id)
    .eq('warehouse_id', warehouseId)
    .maybeSingle();

  if (invError) throw invError;

  const productStock = Number(product.stock_quantity || 0);
  const inventoryQty = Number(inv?.quantity || 0);

  // Older/demo product imports populate products.stock_quantity without creating
  // warehouse inventory rows. POS uses the default warehouse, so reconcile that
  // mismatch before checkout instead of showing stock that cannot be sold.
  if (productStock > inventoryQty) {
    if (inv?.id) {
      const { error: updateError } = await admin
        .from('inventory')
        .update({ quantity: productStock, updated_at: new Date().toISOString() })
        .eq('id', inv.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await admin.from('inventory').insert({
        product_id: product.id,
        warehouse_id: warehouseId,
        quantity: productStock,
      });
      if (insertError) throw insertError;
    }

    return productStock;
  }

  return inventoryQty;
};

/**
 * POST /api/v1/pos/checkout
 * Optimized high-speed in-store checkout.
 * Validates stock → creates order → reduces inventory atomically.
 */
export const posCheckout = catchAsync(async (req: AuthRequest, res: Response) => {
  const { items, paymentMethod, customerName, customerPhone, warehouseId } = req.body;
  const userId = req.user?.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('No items provided for checkout', 400);
  }

  const admin = await getAdminClient();

  // 1. Resolve warehouse — use provided or fall back to default active warehouse
  let resolvedWarehouseId = warehouseId;
  if (!resolvedWarehouseId) {
    const { data: wh } = await admin
      .from('warehouses')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single();
    if (!wh) throw new AppError('No active warehouse found. Configure a warehouse first.', 400);
    resolvedWarehouseId = wh.id;
  }

  // 2. Validate stock levels for all items before touching anything
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const stockErrors: string[] = [];
  const enrichedItems: any[] = [];
  // eslint-disable-line @typescript-eslint/no-explicit-any

  for (const item of items) {
    const { data: product, error: prodError } = await admin
      .from('products')
      .select('id, name, price, sku, stock_quantity')
      .eq('id', item.productId)
      .single();

    if (prodError || !product) {
      stockErrors.push(`Product ${item.productId} not found`);
      continue;
    }

    const available = await resolvePosInventory(admin, product, resolvedWarehouseId);
    if (available < item.quantity) {
      stockErrors.push(
        `Insufficient stock for "${product.name}": requested ${item.quantity}, available ${available}`
      );
    }

    enrichedItems.push({
      productId: product.id,
      product_name: product.name,
      price: product.price,
      sku: product.sku,
      quantity: item.quantity,
    });
  }

  if (stockErrors.length > 0) {
    throw new AppError(`Stock validation failed:\n• ${stockErrors.join('\n• ')}`, 400);
  }

  // 3. Create order (POS-mode: no user ID required, cash/card payment)
  const orderData = {
    items: enrichedItems,
    totalAmount: enrichedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    paymentMethod: paymentMethod || 'cash',
    payment_status: 'paid',
    status: 'confirmed',
    warehouseId: resolvedWarehouseId,
    order_number: `POS-${Date.now()}`,
    shippingAddress: {
      name: customerName || 'Walk-in Customer',
      phone: customerPhone || '',
      email: 'walkin@pos.local',
    },
  };

  const order = await orderService.createOrder(userId, orderData);

  // 4. Audit POS transaction
  await AuditService.log({
    user_id: userId,
    action: 'POS_CHECKOUT',
    module: 'pos',
    entity_id: order.id,
    new_data: {
      order_number: order.order_number,
      items: enrichedItems.length,
      warehouse_id: resolvedWarehouseId,
      payment_method: paymentMethod,
    },
  });

  res.status(201).json({
    success: true,
    order,
    message: `POS checkout complete. Order ${order.order_number} created.`,
  });
});

/**
 * GET /api/v1/pos/products
 * Lightweight product list with real-time stock for POS terminal display.
 */
export const getPosProducts = catchAsync(async (req: AuthRequest, res: Response) => {
  const { warehouseId } = req.query as { warehouseId?: string };
  const admin = await getAdminClient();
  let resolvedWarehouseId = warehouseId;

  if (!resolvedWarehouseId) {
    const { data: wh } = await admin
      .from('warehouses')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single();
    resolvedWarehouseId = wh?.id;
  }

  const query = admin
    .from('products')
    .select('id, name, price, sku, image_url, category, stock_quantity')
    .eq('status', 'active')
    .order('name');

  const { data: products, error } = await query;
  if (error) throw error;

  // Overlay per-warehouse stock for the same warehouse POS checkout will use.
  if (resolvedWarehouseId && products) {
    const { data: invData } = await admin
      .from('inventory')
      .select('product_id, quantity')
      // eslint-disable-line @typescript-eslint/no-explicit-any
      .eq('warehouse_id', resolvedWarehouseId);

    const invMap = new Map((invData || []).map((i: any) => [i.product_id, i.quantity]));
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-line @typescript-eslint/no-explicit-any

    return res.json(
      products.map((p: any) => ({
        // eslint-disable-line @typescript-eslint/no-explicit-any
        ...p,
        stock_quantity: invMap.has(p.id) ? invMap.get(p.id) : p.stock_quantity,
      }))
    );
  }

  res.json(products);
});
