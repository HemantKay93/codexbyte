import { AdminRepository } from '../repositories/adminRepository.js';

const adminRepo = new AdminRepository();

export class AdminService {
  async getDashboardData() {
    return await adminRepo.getStats();
  }

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
}
