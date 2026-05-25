import { create } from 'zustand';

interface AdminState {
  stats: {
    totalRevenue: number;
    revenueDelta: number;
    salesCount: number;
    salesDelta: number;
    customerCount: number;
    avgOrderValue: number;
    pendingOrders?: number;
    lowStockAlertsCount?: number;
    lowStockItems?: any[];
  };
  recentSales: any[];
  chartData: any[];
  products: any[];
  customers: any[];
  orders: any[];
  error: string | null;
  setStats: (stats: any) => void;
  setRecentSales: (sales: any[]) => void;
  setChartData: (data: any[]) => void;
  setProducts: (products: any[]) => void;
  setCustomers: (customers: any[]) => void;
  setOrders: (orders: any[]) => void;
  setError: (error: string | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: {
    totalRevenue: 0,
    revenueDelta: 0,
    salesCount: 0,
    salesDelta: 0,
    customerCount: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
    lowStockAlertsCount: 0,
    lowStockItems: [],
  },
  recentSales: [],
  chartData: [],
  products: [],
  customers: [],
  orders: [],
  error: null,

  setStats: (stats) => set({ stats }),
  setRecentSales: (recentSales) => set({ recentSales }),
  setChartData: (chartData) => set({ chartData }),
  setProducts: (products) => set({ products }),
  setCustomers: (customers) => set({ customers }),
  setOrders: (orders) => set({ orders }),
  setError: (error) => set({ error }),
}));
