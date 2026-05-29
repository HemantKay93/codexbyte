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
    // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  recentSales: any[];
  // eslint-disable-line @typescript-eslint/no-explicit-any
  chartData: any[];
  // eslint-disable-line @typescript-eslint/no-explicit-any
  products: any[];
  // eslint-disable-line @typescript-eslint/no-explicit-any
  customers: any[];
  // eslint-disable-line @typescript-eslint/no-explicit-any
  orders: any[];
  // eslint-disable-line @typescript-eslint/no-explicit-any
  error: string | null;
  setStats: (stats: any) => void;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  setRecentSales: (sales: any[]) => void;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  setChartData: (data: any[]) => void;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  setProducts: (products: any[]) => void;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  setCustomers: (customers: any[]) => void;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  setOrders: (orders: any[]) => void;
  // eslint-disable-line @typescript-eslint/no-explicit-any
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
