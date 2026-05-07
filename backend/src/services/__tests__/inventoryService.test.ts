import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryService } from '../inventoryService';
import { getAdminClient } from '../../config/supabase';
import { NotificationService } from '../notificationService';

// Mock dependencies
vi.mock('../../config/supabase', () => ({
  getAdminClient: vi.fn(),
}));

vi.mock('../notificationService', () => ({
  NotificationService: {
    notifyLowStock: vi.fn(),
  },
}));

describe('InventoryService', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
    (getAdminClient as any).mockResolvedValue(mockSupabase);
  });

  it('should adjust stock correctly for existing inventory', async () => {
    const mockInventory = { id: 'inv_123', quantity: 10 };
    mockSupabase.maybeSingle.mockResolvedValue({ data: mockInventory, error: null });
    mockSupabase.select.mockResolvedValue({ data: [{ quantity: 15 }], error: null });
    mockSupabase.update.mockResolvedValue({ error: null });
    mockSupabase.insert.mockResolvedValue({ error: null });

    const result = await InventoryService.adjustStock({
      productId: 'prod_1',
      warehouseId: 'wh_1',
      quantity: 5,
      type: 'in',
      userId: 'user_1',
    });

    expect(result.success).toBe(true);
    expect(result.newQuantity).toBe(15);
    expect(mockSupabase.update).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 15 }),
      expect.anything()
    );
  });

  it('should trigger low stock notification if below threshold', async () => {
    const mockInventory = { id: 'inv_123', quantity: 10 };
    mockSupabase.maybeSingle.mockResolvedValue({ data: mockInventory, error: null });
    mockSupabase.update.mockResolvedValue({ error: null });
    mockSupabase.insert.mockResolvedValue({ error: null });
    mockSupabase.select.mockImplementation((table: string) => {
      if (table === 'inventory') return { data: [{ quantity: 3 }], error: null };
      if (table === 'products') return { data: { name: 'Test Product' }, error: null };
      if (table === 'warehouses') return { data: { name: 'Test Warehouse' }, error: null };
      return { data: null, error: null };
    });
    mockSupabase.single.mockResolvedValue({ data: { name: 'Test' }, error: null });

    await InventoryService.adjustStock({
      productId: 'prod_1',
      warehouseId: 'wh_1',
      quantity: -7, // New qty = 3
      type: 'out',
      userId: 'user_1',
    });

    expect(NotificationService.notifyLowStock).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      3
    );
  });

  it('should throw error if insufficient stock', async () => {
    const mockInventory = { id: 'inv_123', quantity: 5 };
    mockSupabase.maybeSingle.mockResolvedValue({ data: mockInventory, error: null });

    await expect(
      InventoryService.adjustStock({
        productId: 'prod_1',
        warehouseId: 'wh_1',
        quantity: -10,
        type: 'out',
        userId: 'user_1',
      })
    ).rejects.toThrow('Insufficient stock');
  });
});
