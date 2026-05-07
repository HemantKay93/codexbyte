import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
  image_url?: string;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  addItem: (item: any, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

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
          });
        } else {
          set({ items: [...items, { ...item, price: itemPrice, quantity: itemQty }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        const newQty = Math.max(0, Math.floor(Number(quantity) || 0));
        if (newQty <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)),
        });
      },

      clearCart: () => set({ items: [] }),

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
