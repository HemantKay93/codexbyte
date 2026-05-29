import { AuditService } from '../../services/auditService.js';

import { AdminRepository } from './admin.repository.js';

const adminRepo = new AdminRepository();

export class AdminService {
  async getSalesReport() {
    const data = await adminRepo.getSalesAnalytics();
    // Process data for charts
    return data;
  }

  async getCustomers() {
    return await adminRepo.getCustomers();
  }

  async getCustomerDetail(id: string) {
    return await adminRepo.getCustomerDetail(id);
  }

  async getWarehouseTasks() {
    return await adminRepo.getWarehouseTasks();
  }

  async getOrderActivity(id: string) {
    return await adminRepo.getOrderActivity(id);
  }

  async createWarehouse(data: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return await adminRepo.createWarehouse(data);
  }

  // eslint-disable-line @typescript-eslint/no-explicit-any
  async updateWarehouse(id: string, data: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return await adminRepo.updateWarehouse(id, data);
  }

  async getWarehouses() {
    return await adminRepo.getWarehouses();
  }

  async getNotifications() {
    return await adminRepo.getNotifications();
  }

  async markNotificationRead(id: string) {
    return await adminRepo.markNotificationRead(id);
  }
  // eslint-disable-line @typescript-eslint/no-explicit-any

  static async getAuditLogs(params: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return await AuditService.getLogs(params);
  }
}
