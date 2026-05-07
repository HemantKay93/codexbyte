import { Request, Response } from 'express';
import { ProductService } from '../services/productService.js';
import { catchAsync } from '../middlewares/error.js';

const productService = new ProductService();

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const products = await productService.getAllProducts(req.query);
  res.json(products);
});

export const getProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.getProduct(req.params.id);
  res.json(product);
});

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const newProduct = await productService.createProduct(req.body);
  res.status(201).json(newProduct);
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const updatedProduct = await productService.updateProduct(req.params.id, req.body);
  res.json(updatedProduct);
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
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
