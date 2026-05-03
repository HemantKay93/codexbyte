import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, LineChart, MonitorSmartphone, Package, ShoppingCart, Users, Tag,
  LayoutTemplate, Megaphone, MessageSquare, LifeBuoy, Shield, Settings,
  ChevronDown, ChevronRight, Boxes, RefreshCcw, Truck, Warehouse,
  FileClock, FileCheck, FileCode, Globe, Code2, Store
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type NavItem = { name: string; href: string; icon: React.ElementType; roles?: string[] };
type NavGroup = { name: string; icon: React.ElementType; items: NavItem[]; roles?: string[] };

const navigation: (NavItem | NavGroup)[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'support'] },
  { name: 'Analytics', href: '/analytics', icon: LineChart, roles: ['admin'] },
  { name: 'Point of Sale', href: '/pos', icon: MonitorSmartphone, roles: ['admin'] },
  {
    name: 'Catalog',
    icon: Package,
    roles: ['admin'],
    items: [
      { name: 'Products', href: '/products', icon: Package },
      { name: 'Add Product', href: '/products/new', icon: Package },
      { name: 'Inventory', href: '/inventory', icon: Boxes },
    ],
  },
  {
    name: 'Orders',
    icon: ShoppingCart,
    roles: ['admin', 'support'],
    items: [
      { name: 'All Orders', href: '/orders', icon: ShoppingCart },
      { name: 'Returns & Refunds', href: '/returns', icon: RefreshCcw },
      { name: 'Warehouse Ops', href: '/warehouse', icon: Warehouse, roles: ['admin'] },
    ],
  },
  {
    name: 'Customers',
    icon: Users,
    roles: ['admin', 'support'],
    items: [
      { name: 'Customer List', href: '/customers', icon: Users },
      { name: 'Reviews', href: '/reviews', icon: MessageSquare, roles: ['admin'] },
    ],
  },
  {
    name: 'Support Hub',
    href: '/support',
    icon: LifeBuoy,
    roles: ['admin', 'support']
  },
  {
    name: 'Marketing',
    icon: Megaphone,
    roles: ['admin'],
    items: [
      { name: 'Campaigns', href: '/marketing', icon: Megaphone },
      { name: 'Discounts', href: '/discounts', icon: Tag },
    ],
  },
  {
    name: 'Content',
    icon: LayoutTemplate,
    roles: ['admin'],
    items: [
      { name: 'CMS Builder', href: '/cms', icon: LayoutTemplate },
      { name: 'Invoice Template', href: '/invoice-template', icon: FileCheck },
    ],
  },
  {
    name: 'Operations',
    icon: Truck,
    roles: ['admin'],
    items: [
      { name: 'Suppliers', href: '/suppliers', icon: Truck },
      { name: 'Multi-Store', href: '/stores', icon: Globe },
    ],
  },
  {
    name: 'System',
    icon: Settings,
    roles: ['admin'],
    items: [
      { name: 'Tax & Compliance', href: '/tax-compliance', icon: FileClock },
      { name: 'Activity Log', href: '/activity-log', icon: FileCode },
      { name: 'Developers', href: '/developers', icon: Code2 },
      { name: 'Team', href: '/team', icon: Shield },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

function isGroup(item: NavItem | NavGroup): item is NavGroup {
  return 'items' in item;
}

function NavGroupItem({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const Icon = group.icon;
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role || 'user';

  // Filter group items based on role
  const filteredItems = group.items.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  if (filteredItems.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
      >
        <div className="flex items-center">
          <Icon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
          {group.name}
        </div>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
        )}
      </button>
      {open && (
        <div className="mt-1 ml-4 pl-4 border-l border-outline-variant space-y-0.5">
          {filteredItems.map((item) => {
            const ItemIcon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                       ? 'bg-primary-container text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`
                }
              >
                <ItemIcon className="mr-3 h-4 w-4 shrink-0" aria-hidden="true" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role || 'user';

  // Filter top-level navigation based on role
  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <div className="flex w-64 flex-col border-r border-outline-variant bg-surface">
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Store className="h-4 w-4 text-on-primary" />
        </div>
        <span className="text-lg font-bold text-on-surface">ByteEvolvr</span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        <nav className="flex-1 space-y-0.5">
          {filteredNavigation.map((item) => {
            if (isGroup(item)) {
              return <NavGroupItem key={item.name} group={item} />;
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-container text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
