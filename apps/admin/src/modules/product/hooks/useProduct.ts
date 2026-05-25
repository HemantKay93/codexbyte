import { useAdminStore } from '@byteevolvr/store';
import { ProductService } from '@byteevolvr/api-client';
import { ProductFormData } from '../types/product.types';

export const useProduct = () => {
  const { products, setProducts, error, setError } = useAdminStore();

  const fetchProducts = async () => {
    
    setError(null);
    try {
      const data = await ProductService.getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.customMessage || 'Failed to fetch products');
    } finally {
      
    }
  };

  const saveProduct = async (data: ProductFormData) => {
    
    setError(null);
    try {
      if (data.id) {
        await ProductService.updateProduct(data.id, data);
      } else {
        await ProductService.createProduct(data);
      }
      await fetchProducts();
    } catch (err: any) {
      setError(err.customMessage || 'Failed to save product');
      throw err;
    } finally {
      
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setError(null);
    try {
      await ProductService.deleteProduct(id);
      await fetchProducts();
    } catch (err: any) {
      setError(err.customMessage || 'Failed to delete product');
    } finally {
      
    }
  };

  return {
    products,
    error,
    fetchProducts,
    saveProduct,
    deleteProduct,
  };
};
