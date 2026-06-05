import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  MonitorSmartphone,
  Package,
  ShoppingCart,
  Users,
  Tag,
  LayoutTemplate,
  Megaphone,
  MessageSquare,
  LifeBuoy,
  Shield,
  Settings,
  ChevronDown,
  ChevronRight,
  Boxes,
  RefreshCcw,
  Truck,
  Warehouse,
  FileClock,
  FileCheck,
  FileCode,
  Globe,
  Code2,
  Store,
  Send,
  ListTodo,
  FileText,
  FolderOpen,
  GitBranch,
  CheckSquare,
  Activity,
  Briefcase,
  Clock,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Building,
  Scale,
  TrendingUp,
  Network,
  Target,
  Calendar,
  Receipt,
} from 'lucide-react';
import { useAuthStore } from '@byteevolvr/store';

type NavItem = { name: string; href: string; icon: React.ElementType; roles?: string[] };
type NavGroup = { name: string; icon: React.ElementType; items: NavItem[]; roles?: string[] };

const navigation: (NavItem | NavGroup)[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'super-admin', 'support'],
  },
  { name: 'Analytics', href: '/analytics', icon: LineChart, roles: ['admin', 'super-admin'] },
  { name: 'Reports Hub', href: '/reports', icon: FileText, roles: ['admin', 'super-admin'] },
  { name: 'Point of Sale', href: '/pos', icon: MonitorSmartphone, roles: ['admin', 'super-admin'] },
  {
    name: 'Catalog',
    icon: Package,
    roles: ['admin', 'super-admin'],
    items: [
      { name: 'Products', href: '/products', icon: Package },
      { name: 'Add Product', href: '/products/new', icon: Package },
      { name: 'Inventory Dashboard', href: '/inventory/dashboard', icon: LayoutDashboard },
      { name: 'Inventory Grid', href: '/inventory', icon: Boxes },
      { name: 'Stock Transfers', href: '/inventory/transfers', icon: ArrowRightLeft },
    ],
  },
  {
    name: 'Orders',
    icon: ShoppingCart,
    roles: ['admin', 'super-admin', 'support'],
    items: [
      { name: 'All Orders', href: '/orders', icon: ShoppingCart },
      { name: 'Returns & Refunds', href: '/returns', icon: RefreshCcw },
      {
        name: 'Warehouse Ops',
        href: '/warehouse',
        icon: Warehouse,
        roles: ['admin', 'super-admin'],
      },
    ],
  },
  {
    name: 'Customers',
    icon: Users,
    roles: ['admin', 'super-admin', 'support'],
    items: [
      { name: 'Customer List', href: '/customers', icon: Users },
      { name: 'Reviews', href: '/reviews', icon: MessageSquare, roles: ['admin', 'super-admin'] },
    ],
  },
  {
    name: 'Support Hub',
    icon: LifeBuoy,
    roles: ['admin', 'super-admin', 'support'],
    items: [
      { name: 'Unified Inbox', href: '/support', icon: MessageSquare },
      { name: 'Knowledge Base', href: '/support/knowledge-base', icon: FileText },
    ],
  },
  {
    name: 'Marketing',
    icon: Megaphone,
    roles: ['admin', 'super-admin'],
    items: [
      { name: 'Campaigns', href: '/marketing', icon: Megaphone },
      { name: 'Discounts', href: '/discounts', icon: Tag },
    ],
  },
  {
    name: 'Content',
    icon: LayoutTemplate,
    roles: ['admin', 'super-admin'],
    items: [
      { name: 'CMS Builder', href: '/cms', icon: LayoutTemplate },
      { name: 'Invoice Template', href: '/invoice-template', icon: FileCheck },
    ],
  },
  {
    name: 'CRM & Sales',
    icon: Briefcase,
    roles: ['admin', 'super-admin', 'sales'],
    items: [
      { name: 'Dashboard', href: '/crm', icon: LayoutDashboard },
      { name: 'Leads', href: '/crm/leads', icon: Users },
      { name: 'Pipelines', href: '/crm/pipeline', icon: GitBranch },
      { name: 'Forecasting', href: '/crm/forecasting', icon: LineChart },
      { name: 'Settings', href: '/crm/settings', icon: Settings },
    ],
  },
  {
    name: 'Procurement',
    icon: Truck,
    roles: ['admin', 'super-admin'],
    items: [
      { name: 'Suppliers', href: '/suppliers', icon: Users },
      { name: 'Purchase Requests', href: '/procurement/requests', icon: FileText },
      { name: 'Purchase Orders', href: '/procurement/orders', icon: FileCheck },
      { name: 'Vendor Bills', href: '/procurement/bills', icon: Receipt },
    ],
  },
  {
    name: 'Operations',
    icon: Activity,
    roles: ['admin', 'super-admin'],
    items: [
      { name: 'Command Center', href: '/operations', icon: Activity },
      { name: 'SLA Dashboard', href: '/sla', icon: Clock },
      { name: 'Multi-Store', href: '/stores', icon: Globe },
    ],
  },
  {
    name: 'Shipping & Delivery',
    icon: Truck,
    roles: ['admin', 'super-admin'],
    items: [
      { name: 'Dashboard', href: '/shipping/dashboard', icon: LayoutDashboard },
      { name: 'Tracking', href: '/shipping/tracking', icon: Activity },
      { name: 'Zones & Rates', href: '/shipping/zones', icon: Globe },
    ],
  },
  {
    name: 'Documents',
    icon: FolderOpen,
    items: [{ name: 'Document Center', href: '/documents', icon: FolderOpen }],
  },
  {
    name: 'Approvals',
    icon: CheckSquare,
    roles: ['admin', 'super-admin', 'manager'],
    items: [
      { name: 'My Inbox', href: '/approvals', icon: CheckSquare },
      { name: 'Templates', href: '/approvals/templates', icon: LayoutTemplate },
    ],
  },
  {
    name: 'Automations',
    icon: GitBranch,
    roles: ['admin', 'super-admin'],
    items: [{ name: 'Workflow Builder', href: '/workflows', icon: GitBranch }],
  },
  {
    name: 'WhatsApp Bot',
    icon: Send,
    roles: ['admin', 'super-admin'],
    items: [
      { name: 'Dashboard', href: '/whatsapp', icon: Send },
      { name: 'Campaigns', href: '/whatsapp/campaigns', icon: Megaphone },
      { name: 'Task Queue', href: '/whatsapp/tasks', icon: ListTodo },
      { name: 'Templates', href: '/whatsapp/templates', icon: FileText },
    ],
  },
  {
    name: 'Accounting',
    icon: FileText,
    roles: ['admin', 'super-admin'],
    items: [
      { name: 'Dashboard', href: '/accounting', icon: LayoutDashboard },
      { name: 'Receivables', href: '/accounting/receivables', icon: ArrowUpRight },
      { name: 'Payables', href: '/accounting/payables', icon: ArrowDownRight },
      { name: 'Invoices', href: '/accounting/invoices', icon: FileText },
      { name: 'Journal Entries', href: '/accounting/journal', icon: BookOpen },
      { name: 'Bank Accounts', href: '/accounting/bank-accounts', icon: Building },
      { name: 'Trial Balance', href: '/accounting/trial-balance', icon: Scale },
      { name: 'Profit & Loss', href: '/accounting/profit-loss', icon: TrendingUp },
      { name: 'Cash Flow', href: '/accounting/cash-flow', icon: Activity },
      { name: 'Cost Centers', href: '/accounting/cost-centers', icon: Network },
      { name: 'Profit Centers', href: '/accounting/profit-centers', icon: TrendingUp },
      { name: 'Budgets', href: '/accounting/budgets', icon: Target },
      { name: 'Financial Year', href: '/accounting/financial-year', icon: Calendar },
      { name: 'GST Filing', href: '/accounting/gst', icon: FileText },
      { name: 'Settings', href: '/accounting/settings', icon: Settings },
    ],
  },
  {
    name: 'System',
    icon: Settings,
    roles: ['admin', 'super-admin'],
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
  const { user, isAdmin } = useAuthStore();
  const userRole = user?.role || user?.user_metadata?.role || (isAdmin ? 'admin' : 'user');

  // Filter group items based on role
  const filteredItems = group.items.filter((item) => !item.roles || item.roles.includes(userRole));

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
  const { user, isAdmin } = useAuthStore();
  const userRole = user?.role || user?.user_metadata?.role || (isAdmin ? 'admin' : 'user');

  // Filter top-level navigation based on role
  const filteredNavigation = navigation.filter(
    (item) => !item.roles || item.roles.includes(userRole)
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
