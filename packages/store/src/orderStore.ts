import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  trackingId?: string;
}

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  setOrders: (orders: Order[]) => void;
  setActiveOrder: (order: Order | null) => void;
  addOrder: (order: Order) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      activeOrder: null,
      isLoading: false,
      error: null,

      setOrders: (orders) => set({ orders }),
      setActiveOrder: (activeOrder) => set({ activeOrder }),
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'byteevolvr-order-storage',
    }
  )
);
