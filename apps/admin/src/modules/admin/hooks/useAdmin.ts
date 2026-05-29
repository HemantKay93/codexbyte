import { useState, useCallback } from 'react';
import { AdminService } from '@byteevolvr/api-client';
import { useAdminStore } from '@byteevolvr/store';

export const useAdmin = () => {
  const { stats, setStats, recentSales, setRecentSales, chartData, setChartData, error, setError } =
    useAdminStore();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDashboardLoading, setDashboardLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setDashboardLoading(true);
    setError(null);
    try {
      const statsData = await AdminService.getDashboardStats();
      const [recentOrdersData, chartDataRaw] = await Promise.all([
        AdminService.getOrders({ limit: 5 }),
        AdminService.getRevenueChart(6),
      ]);

      setStats(statsData);
      setRecentSales(recentOrdersData?.data || recentOrdersData || []);
      setChartData(chartDataRaw || []);
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.customMessage || 'Failed to fetch dashboard data');
    } finally {
      setDashboardLoading(false);
    }
  }, [setError, setStats, setRecentSales, setChartData]);

  const fetchOrderDetail = async (id: string) => {
    try {
      const orderData = await AdminService.getOrderDetail(id);
      return orderData;
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.customMessage || 'Failed to fetch order details');
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, data: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    setIsUpdating(true);
    try {
      await AdminService.updateOrderStatus(orderId, data);
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.customMessage || 'Failed to update order status');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const getCustomers = async () => {
    try {
      const data = await AdminService.getCustomers();
      return data;
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.customMessage || 'Failed to fetch customers');
      return [];
    }
  };

  const [warehouses, setWarehouses] = useState<any[]>([]);
  // eslint-disable-line @typescript-eslint/no-explicit-any

  const fetchWarehouses = async () => {
    try {
      const data = await AdminService.getWarehouses();
      setWarehouses(data || []);
      return data;
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.customMessage || 'Failed to fetch warehouses');
      return [];
    }
  };

  const adjustStock = async (data: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    setIsUpdating(true);
    try {
      await AdminService.adjustStock(data);
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.customMessage || 'Failed to adjust stock');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    stats,
    recentSales,
    chartData,
    isLoading: isDashboardLoading,
    error,
    warehouses,
    fetchDashboardData,
    fetchOrderDetail,
    updateOrderStatus,
    getCustomers,
    fetchWarehouses,
    adjustStock,
    isUpdating,
  };
};
