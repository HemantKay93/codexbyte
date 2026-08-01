import { AppError } from '../../middlewares/error.js';
import { generateSKU } from '../../utils/sku.js';
import { slugify } from '../../utils/slugify.js';

import { ProductRepository } from './product.repository.js';

const productRepo = new ProductRepository();

export class ProductService {
  async getAllProducts(filters: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return await productRepo.findAll(filters);
  }

  async getProduct(id: string) {
    const product = await productRepo.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  // eslint-disable-line @typescript-eslint/no-explicit-any
  async createProduct(data: any, userId?: string) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // Sanitize and map fields
    const sanitizedData = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      original_price: data.original_price ? Number(data.original_price) : null,
      image_url: data.image_url,
      category: data.category,
      brand: data.brand,
      sku: data.sku || generateSKU(data),
      stock_quantity: Number(data.stock_quantity) || 0,
      status: data.status || 'active',
      images: Array.isArray(data.images) ? data.images : data.image_url ? [data.image_url] : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      slug: data.slug || slugify(data.name),
      variants: data.variants || [],
      specifications: data.specifications || {},
    };

    return await productRepo.create(sanitizedData, userId);
  }
  // eslint-disable-next-line complexity, @typescript-eslint/no-explicit-any

  async updateProduct(id: string, data: any, userId?: string) {
    // eslint-disable-line complexity
    const existing = await productRepo.findById(id);
    if (!existing) {
      throw new AppError('Product not found', 404);
      // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    const sanitizedData: any = {};
    // eslint-disable-line @typescript-eslint/no-explicit-any

    if (data.name) sanitizedData.name = data.name;
    if (data.description !== undefined) sanitizedData.description = data.description;
    if (data.price !== undefined) sanitizedData.price = Number(data.price);
    if (data.original_price !== undefined)
      sanitizedData.original_price =
        data.original_price !== null ? Number(data.original_price) : null;
    if (data.image_url !== undefined) sanitizedData.image_url = data.image_url;
    if (data.category) sanitizedData.category = data.category;
    if (data.brand !== undefined) sanitizedData.brand = data.brand;
    if (data.sku) sanitizedData.sku = data.sku;
    if (data.stock_quantity !== undefined)
      sanitizedData.stock_quantity = Number(data.stock_quantity);
    if (data.status) sanitizedData.status = data.status;
    if (data.images !== undefined)
      sanitizedData.images = Array.isArray(data.images) ? data.images : [data.images];
    if (data.tags !== undefined)
      sanitizedData.tags = Array.isArray(data.tags) ? data.tags : [data.tags];
    if (data.variants !== undefined) sanitizedData.variants = data.variants;
    if (data.specifications !== undefined) sanitizedData.specifications = data.specifications;
    if (data.slug) sanitizedData.slug = data.slug;

    return await productRepo.update(id, sanitizedData, userId);
  }

  async deleteProduct(id: string, userId?: string) {
    const existing = await productRepo.findById(id);
    if (!existing) {
      throw new AppError('Product not found', 404);
    }
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return await productRepo.delete(id, userId);
  }
  // eslint-disable-line complexity

  async bulkImportProducts(products: any[], userId?: string) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const timestamp = Date.now();
    const sanitizedProducts = products.map((data, index) => ({
      // eslint-disable-line complexity
      name: data.name,
      description: data.description || '',
      price: Number(data.price) || 0,
      original_price: data.original_price ? Number(data.original_price) : null,
      image_url: data.image_url || '',
      category: data.category || 'General',
      brand: data.brand || '',
      sku: data.sku || `PROD-${timestamp}-${index}-${Math.floor(1000 + Math.random() * 9000)}`,
      stock_quantity: Number(data.stock_quantity) || 0,
      status: data.status || 'active',
      images: Array.isArray(data.images) ? data.images : data.image_url ? [data.image_url] : [],
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
      slug: data.slug || slugify(data.name || 'product'),
      variants: data.variants || [],
    }));

    return await productRepo.bulkCreate(sanitizedProducts, userId);
  }
}
