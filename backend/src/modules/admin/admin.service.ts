import { AdminRepository } from './admin.repository.js';
import { AuditService } from '../../services/auditService.js';

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
    return await adminRepo.createWarehouse(data);
  }

  async updateWarehouse(id: string, data: any) {
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

  static async getAuditLogs(params: any) {
    return await AuditService.getLogs(params);
  }
}

