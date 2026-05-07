import { useState } from 'react';
import { AdminService } from '@byteevolvr/api-client';
import { useAdminStore } from '@byteevolvr/store';

export const useAdmin = () => {
  const { 
    stats, setStats, 
    recentSales, setRecentSales,
    chartData, setChartData,
    isLoading, setLoading, 
    error, setError 
  } = useAdminStore();

  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsData = await AdminService.getDashboardStats();
      const orders = await AdminService.getOrders();
      
      setStats(statsData);
      setRecentSales(orders?.slice(0, 5) || []);
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const revenueByMonth: { [key: string]: number } = {};
      orders?.forEach((o: any) => {
        const date = new Date(o.created_at);
        revenueByMonth[months[date.getMonth()]] = (revenueByMonth[months[date.getMonth()]] || 0) + Number(o.total_amount);
      });

      const currentMonthIndex = new Date().getMonth();
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const idx = (currentMonthIndex - i + 12) % 12;
        last6Months.push({ name: months[idx], total: revenueByMonth[months[idx]] || 0 });
      }
      setChartData(last6Months);
    } catch (err: any) {
      setError(err.customMessage || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (id: string) => {
    setLoading(true);
    try {
      const orderData = await AdminService.getOrderDetail(id);
      return orderData;
    } catch (err: any) {
      setError(err.customMessage || 'Failed to fetch order details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, data: any) => {
    setIsUpdating(true);
    try {
      await AdminService.updateOrderStatus(orderId, data);
    } catch (err: any) {
      setError(err.customMessage || 'Failed to update order status');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const getCustomers = async () => {
    setLoading(true);
    try {
      const data = await AdminService.getCustomers();
      return data;
    } catch (err: any) {
      setError(err.customMessage || 'Failed to fetch customers');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    recentSales,
    chartData,
    isLoading,
    error,
    fetchDashboardData,
    fetchOrderDetail,
    updateOrderStatus,
    getCustomers,
    isUpdating,
  };
};
