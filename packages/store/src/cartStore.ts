import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
  image_url?: string;
  brand?: string;
  max_stock?: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  addItem: (item: any, quantity?: number) => void;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
  appliedDiscount: { code: string; discount: number; couponId: string } | null;
  setAppliedDiscount: (
    discount: { code: string; discount: number; couponId: string } | null
  ) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      appliedDiscount: null,

      setAppliedDiscount: (discount) => set({ appliedDiscount: discount }),

      addItem: (item, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === item.id);
        const itemPrice = Number(item.price);
        const itemQty = Number(quantity);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + itemQty } : i
            ),
            appliedDiscount: null,
          });
        } else {
          set({
            items: [
              ...items,
              {
                ...item,
                price: itemPrice,
                quantity: itemQty,
                max_stock: item.stock_quantity ?? item.max_stock ?? 999,
                image_url: item.image_url || item.images?.[0]?.url || item.image || '',
                brand: item.brand || item.brand_name || '',
              },
            ],
            appliedDiscount: null,
          });
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((i) => i.id !== id),
          appliedDiscount: null,
        });
      },

      updateQuantity: (id, quantity) => {
        const newQty = Math.max(0, Math.floor(Number(quantity) || 0));
        if (newQty <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)),
          appliedDiscount: null,
        });
      },

      clearCart: () => set({ items: [], appliedDiscount: null }),

      totalAmount: () => {
        return get().items.reduce((total, item) => {
          const price = Number(item.price) || 0;
          const qty = Number(item.quantity) || 0;
          return total + price * qty;
        }, 0);
      },

      totalItems: () => {
        return get().items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
      },
    }),
    {
      name: 'byteevolvr-cart-storage',
    }
  )
);
