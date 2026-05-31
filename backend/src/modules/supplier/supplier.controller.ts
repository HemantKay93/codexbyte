import { Request, Response } from 'express';

import { AuthRequest } from '../../middlewares/auth.js';
import { catchAsync } from '../../middlewares/error.js';
import { createResponse } from '../../utils/apiResponse.js';

import { SupplierService } from './supplier.service.js';

const supplierService = new SupplierService();

export const getSuppliers = catchAsync(async (req: Request, res: Response) => {
  const suppliers = await supplierService.getSuppliers();
  res.json(createResponse(suppliers, 'Suppliers fetched successfully'));
});

export const getSupplierById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const supplier = await supplierService.getSupplierById(id as string);
  res.json(createResponse(supplier, 'Supplier fetched successfully'));
});

export const createSupplier = catchAsync(async (req: Request, res: Response) => {
  const supplier = await supplierService.createSupplier(req.body);
  res.status(201).json(createResponse(supplier, 'Supplier created successfully'));
});

export const getPurchaseOrders = catchAsync(async (req: Request, res: Response) => {
  const { supplierId } = req.query;
  const pos = await supplierService.getPurchaseOrders(supplierId as string);
  res.json(createResponse(pos, 'Purchase orders fetched successfully'));
});

export const createPurchaseOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const po = await supplierService.createPurchaseOrder(req.body, req.user!.id);
  res.status(201).json(createResponse(po, 'Purchase order created successfully'));
});

export const receivePurchaseOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { warehouseId } = req.body;
  const result = await supplierService.receivePurchaseOrder(
    id as string,
    warehouseId as string,
    req.user!.id as string
  );
  res.json(createResponse(result, 'Purchase order received successfully'));
});
