import { Request, Response } from 'express';
import { getAdminClient } from '../config/supabase.js';
import { InventoryService } from '../services/inventoryService.js';
import { AuditService } from '../services/auditService.js';
import { catchAsync } from '../middlewares/error.js';
import { AuthRequest } from '../middlewares/auth.js';

export const getAllWarehouses = catchAsync(async (req: Request, res: Response) => {
  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('warehouses')
    .select('*')
    .is('deleted_at', null)
    .order('name');
  if (error) throw error;
  res.json({
    success: true,
    data,
  });
});

export const createWarehouse = catchAsync(async (req: AuthRequest, res: Response) => {
  const admin = await getAdminClient();
  const { data, error } = await admin.from('warehouses').insert(req.body).select().single();
  if (error) throw error;

  await AuditService.log({
    user_id: req.user?.id,
    action: 'CREATE_WAREHOUSE',
    module: 'inventory',
    entity_id: data.id,
    new_data: data,
  });

  res.status(201).json({
    success: true,
    data,
  });
});

export const adjustStock = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await InventoryService.adjustStock({
    ...req.body,
    userId: req.user?.id,
  });

  await AuditService.log({
    user_id: req.user?.id,
    action: 'ADJUST_STOCK',
    module: 'inventory',
    entity_id: req.body.productId,
    new_data: req.body,
  });

  res.json({
    success: true,
    data: result,
  });
});

export const transferStock = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await InventoryService.transferStock({
    ...req.body,
    userId: req.user?.id,
  });

  await AuditService.log({
    user_id: req.user?.id,
    action: 'TRANSFER_STOCK',
    module: 'inventory',
    entity_id: req.body.productId,
    new_data: req.body,
  });

  res.json({
    success: true,
    data: result,
  });
});

export const getWarehouseInventory = catchAsync(async (req: Request, res: Response) => {
  const data = await InventoryService.getWarehouseStock(req.params.id as string);
  res.json({
    success: true,
    data,
  });
});

export const markTaskPicked = catchAsync(async (req: AuthRequest, res: Response) => {
  const { orderId, productId, notes } = req.body;
  if (!orderId) {
    return res.status(400).json({ message: 'orderId is required' });
  }

  // Persist the pick action as an order activity log entry
  await AuditService.logOrderActivity({
    order_id: orderId,
    status: 'packed',
    notes: notes || `Item picked: ${productId || 'unknown SKU'}`,
    performed_by: req.user?.id,
  });

  // Also write a system audit entry
  await AuditService.log({
    user_id: req.user?.id,
    action: 'WAREHOUSE_PICK',
    module: 'warehouse',
    entity_id: orderId,
    new_data: { productId, pickedAt: new Date().toISOString() },
  });

  res.json({ success: true });
});
