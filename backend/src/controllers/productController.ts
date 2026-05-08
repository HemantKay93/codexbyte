import { Request, Response } from 'express';
import { ProductService } from '../services/productService.js';
import { catchAsync } from '../middlewares/error.js';
import { CacheService } from '../services/cacheService.js';
import { AuditService } from '../services/auditService.js';
import { AuthRequest } from '../middlewares/auth.js';

const productService = new ProductService();

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const cacheKey = `products:list:${JSON.stringify(req.query)}`;
  const cached = await CacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const products = await productService.getAllProducts(req.query);
  await CacheService.set(cacheKey, products, 300); // 5 min cache
  res.json(products);
});

export const getProduct = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const cacheKey = `products:detail:${id}`;
  const cached = await CacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const product = await productService.getProduct(id);
  await CacheService.set(cacheKey, product, 600); // 10 min cache
  res.json(product);
});

export const createProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const newProduct = await productService.createProduct(req.body);

  await AuditService.log({
    user_id: req.user?.id,
    action: 'CREATE_PRODUCT',
    module: 'products',
    entity_id: newProduct.id,
    new_data: newProduct,
  });

  await CacheService.invalidatePattern('products:list:*');
  res.status(201).json(newProduct);
});

export const updateProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const updatedProduct = await productService.updateProduct(id, req.body);

  await AuditService.log({
    user_id: req.user?.id,
    action: 'UPDATE_PRODUCT',
    module: 'products',
    entity_id: id,
    new_data: req.body,
  });

  await CacheService.del(`products:detail:${id}`);
  await CacheService.invalidatePattern('products:list:*');
  res.json(updatedProduct);
});

export const deleteProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  await productService.deleteProduct(id);

  await AuditService.log({
    user_id: req.user?.id,
    action: 'DELETE_PRODUCT',
    module: 'products',
    entity_id: id,
  });

  await CacheService.del(`products:detail:${id}`);
  await CacheService.invalidatePattern('products:list:*');
  res.status(204).end();
});

export const bulkImportProducts = catchAsync(async (req: Request, res: Response) => {
  const products = req.body.products;
  if (!Array.isArray(products)) {
    return res.status(400).json({ message: 'Products must be an array' });
  }
  const result = await productService.bulkImportProducts(products);
  res.status(201).json(result);
});
