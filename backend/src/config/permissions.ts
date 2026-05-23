export type Permission =
  | 'products:read'
  | 'products:write'
  | 'products:delete'
  | 'orders:read'
  | 'orders:write'
  | 'orders:delete'
  | 'users:read'
  | 'users:write'
  | 'inventory:read'
  | 'inventory:write'
  | 'analytics:read'
  | 'cms:write'
  | 'settings:write';

export const RolePermissions: Record<string, Permission[]> = {
  'super-admin': [
    'products:read',
    'products:write',
    'products:delete',
    'orders:read',
    'orders:write',
    'orders:delete',
    'users:read',
    'users:write',
    'inventory:read',
    'inventory:write',
    'analytics:read',
    'cms:write',
    'settings:write',
  ],
  admin: [
    'products:read',
    'products:write',
    'orders:read',
    'orders:write',
    'users:read',
    'inventory:read',
    'inventory:write',
    'analytics:read',
    'cms:write',
  ],
  manager: [
    'products:read',
    'products:write',
    'orders:read',
    'orders:write',
    'inventory:read',
    'inventory:write',
    'analytics:read',
  ],
  staff: ['products:read', 'orders:read', 'orders:write', 'inventory:read', 'inventory:write'],
  customer: ['products:read'],
};
