import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryService } from '../inventory.service.js';
import { getAdminClient } from '../../config/supabase.js';
import { NotificationService } from '../notificationService.js';

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
  let queryResults: any[];
  let builders: any[];

  const createBuilder = (result: any) => {
    const builder: any = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      update: vi.fn(() => builder),
      insert: vi.fn(() => builder),
      maybeSingle: vi.fn().mockResolvedValue(result),
      single: vi.fn().mockResolvedValue(result),
      then: (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject),
    };
    builders.push(builder);
    return builder;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryResults = [];
    builders = [];
    mockSupabase = {
      from: vi.fn(() => createBuilder(queryResults.shift() || { data: null, error: null })),
    };
    (getAdminClient as any).mockResolvedValue(mockSupabase);
  });

  it('should adjust stock correctly for existing inventory', async () => {
    const mockInventory = { id: 'inv_123', quantity: 10 };
    queryResults.push(
      { data: mockInventory, error: null },
      { error: null },
      { error: null },
      { data: [{ quantity: 15 }], error: null },
      { error: null },
      { data: null, error: null },
      { data: null, error: null }
    );

    const result = await InventoryService.adjustStock({
      productId: 'prod_1',
      warehouseId: 'wh_1',
      quantity: 5,
      type: 'in',
      userId: 'user_1',
    });

    expect(result.success).toBe(true);
    expect(result.newQuantity).toBe(15);
    expect(builders[1].update).toHaveBeenCalledWith(expect.objectContaining({ quantity: 15 }));
  });

  it('should trigger low stock notification if below threshold', async () => {
    const mockInventory = { id: 'inv_123', quantity: 10 };
    queryResults.push(
      { data: mockInventory, error: null },
      { error: null },
      { error: null },
      { data: [{ quantity: 3 }], error: null },
      { error: null },
      { data: { name: 'Test Product' }, error: null },
      { data: { name: 'Test Warehouse' }, error: null }
    );

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
    queryResults.push({ data: mockInventory, error: null });

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
