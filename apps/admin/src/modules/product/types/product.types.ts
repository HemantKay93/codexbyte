export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url?: string;
  category: string;
  brand?: string;
  sku: string;
  stock_quantity: number;
  status: 'active' | 'draft' | 'out_of_stock';
  featured?: boolean;
  sort_order?: number;
  specifications?: any;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  qna?: any;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  created_at: string;
}

export interface ProductFormData extends Omit<Product, 'id' | 'created_at'> {
  id?: string;
}
