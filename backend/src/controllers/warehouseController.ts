import { Request, Response } from 'express';
import { getAdminClient } from '../config/supabase.js';
import { InventoryService } from '../services/inventoryService.js';
import { catchAsync } from '../middlewares/error.js';
import { AuthRequest } from '../middlewares/auth.js';

export const getAllWarehouses = catchAsync(async (req: Request, res: Response) => {
  const admin = await getAdminClient();
  const { data, error } = await admin.from('warehouses').select('*').order('name');
  if (error) throw error;
  res.json(data);
});

export const createWarehouse = catchAsync(async (req: Request, res: Response) => {
  const admin = await getAdminClient();
  const { data, error } = await admin.from('warehouses').insert(req.body).select().single();
  if (error) throw error;
  res.status(201).json(data);
});

export const adjustStock = catchAsync(async (req: AuthRequest, res: Response) => {
  console.log('[Warehouse] Processing stock adjustment:', req.body);
  try {
    const result = await InventoryService.adjustStock({
      ...req.body,
      userId: req.user?.id,
    });
    console.log('[Warehouse] Adjustment successful');
    res.json(result);
  } catch (error: any) {
    console.error('[Warehouse] Adjustment error:', error);
    res.status(error.status || 500).json({
      message: error.message || 'Failed to adjust stock',
      details: error.details || error,
    });
  }
});

export const getWarehouseInventory = catchAsync(async (req: Request, res: Response) => {
  const data = await InventoryService.getWarehouseStock(req.params.id);
  res.json(data);
});
