import { useAdminStore } from '@byteevolvr/store';
import { ProductService } from '@byteevolvr/api-client';
import { ProductFormData } from '../types/product.types';

export const useProduct = () => {
  const { products, setProducts, isLoading, setLoading, error, setError } = useAdminStore();

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProductService.getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.customMessage || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async (data: ProductFormData) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setLoading(true);
    setError(null);
    try {
      await ProductService.deleteProduct(id);
      await fetchProducts();
    } catch (err: any) {
      setError(err.customMessage || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    saveProduct,
    deleteProduct,
  };
};
