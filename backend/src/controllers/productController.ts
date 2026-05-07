import { Request, Response } from 'express';
import { ProductService } from '../services/productService.js';
import { catchAsync } from '../middlewares/error.js';
import { CacheService } from '../services/cacheService.js';


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
  const cacheKey = `products:detail:${req.params.id}`;
  const cached = await CacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const product = await productService.getProduct(req.params.id);
  await CacheService.set(cacheKey, product, 600); // 10 min cache
  res.json(product);
});


export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const newProduct = await productService.createProduct(req.body);
  await CacheService.invalidatePattern('products:list:*');
  res.status(201).json(newProduct);
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const updatedProduct = await productService.updateProduct(req.params.id, req.body);
  await CacheService.del(`products:detail:${req.params.id}`);
  await CacheService.invalidatePattern('products:list:*');
  res.json(updatedProduct);
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  await CacheService.del(`products:detail:${req.params.id}`);
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
