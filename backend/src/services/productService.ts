import { ProductRepository } from '../repositories/productRepository.js';
import { AppError } from '../middlewares/error.js';
import { generateSKU, generateSlug } from '../utils/sku.js';

const productRepo = new ProductRepository();

export class ProductService {
  async getAllProducts(filters: any) {
    return await productRepo.findAll(filters);
  }

  async getProduct(id: string) {
    const product = await productRepo.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async createProduct(data: any) {
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
      slug: data.slug || generateSlug(data.name),
      variants: data.variants || [],
      updated_at: new Date().toISOString(),
    };

    return await productRepo.create(sanitizedData);
  }
  async updateProduct(id: string, data: any) {
    const existing = await productRepo.findById(id);
    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    const sanitizedData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.name) sanitizedData.name = data.name;
    if (data.description) sanitizedData.description = data.description;
    if (data.price !== undefined) sanitizedData.price = Number(data.price);
    if (data.original_price !== undefined)
      sanitizedData.original_price = Number(data.original_price);
    if (data.image_url) sanitizedData.image_url = data.image_url;
    if (data.category) sanitizedData.category = data.category;
    if (data.brand) sanitizedData.brand = data.brand;
    if (data.sku) sanitizedData.sku = data.sku;
    if (data.stock_quantity !== undefined)
      sanitizedData.stock_quantity = Number(data.stock_quantity);
    if (data.status) sanitizedData.status = data.status;
    if (data.images)
      sanitizedData.images = Array.isArray(data.images) ? data.images : [data.images];
    if (data.tags) sanitizedData.tags = Array.isArray(data.tags) ? data.tags : [data.tags];
    if (data.variants) sanitizedData.variants = data.variants;

    return await productRepo.update(id, sanitizedData);
  }

  async deleteProduct(id: string) {
    const existing = await productRepo.findById(id);
    if (!existing) {
      throw new AppError('Product not found', 404);
    }
    return await productRepo.delete(id);
  }
  async bulkImportProducts(products: any[]) {
    const timestamp = Date.now();
    const sanitizedProducts = products.map((data, index) => ({
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
      slug: data.slug || generateSlug(data.name || 'product'),
      variants: data.variants || [],
      updated_at: new Date().toISOString(),
    }));

    return await productRepo.bulkCreate(sanitizedProducts);
  }
}
