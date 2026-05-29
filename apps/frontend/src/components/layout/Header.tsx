import { NavLink, Link, useLocation } from 'react-router-dom';
import { Navbar } from '@byteevolvr/ui';
import { Mail, Phone, ShoppingCart, User } from 'lucide-react';
import { useAuthStore, useCartStore } from '@byteevolvr/store';

import { ShopMegaMenu } from './ShopMegaMenu';

import { AppLogo } from '@/components/ui/AppLogo';
import { useCMS } from '@/features/cms/useCMS';

const navLinks = [
  { label: 'Home', to: '/home' },
  { label: 'Services', to: '/services' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

function ShopNavLinks() {
  const shopLinks = [
    { label: 'Gaming Gears', to: '/shop?category=gaming' },
    { label: 'Networking', to: '/shop?category=networking' },
    { label: 'Custom Build', to: '/shop/custom-build' },
  ];

  return (
    <div className="hidden items-center gap-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-md px-2 py-1.5 lg:flex shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
      <ShopMegaMenu />

      {shopLinks.map((link) => (
        <NavLink
          key={link.label}
          to={link.to}
          className={({ isActive }) =>
            `relative px-4 py-1.5 text-sm font-medium transition-all duration-300 rounded-full overflow-hidden group ${
              isActive ? 'text-white' : 'text-brand-muted hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute inset-0 bg-primary/20 rounded-full border border-primary/30" />
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              )}
              <span className="relative z-10 whitespace-nowrap">{link.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export function Header() {
  const { user } = useAuthStore();
  const { totalItems } = useCartStore();
  const itemCount = totalItems();
  const location = useLocation();
  const isShopRoute = location.pathname.startsWith('/shop');

  const { data: globalCms } = useCMS('global');
  const { data: homeCms } = useCMS('home');

  const contact = globalCms?.contact ||
    homeCms?.contact || {
      email: 'hello@byteevolvr.com',
      phone: '+91 78889 57575',
    };

  return (
    <Navbar
      logo={
        <NavLink to="/home" className="flex items-center gap-3 group relative">
          <div className="absolute -inset-2 bg-accent/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <AppLogo size={32} />
          <span className="relative z-10 font-display text-base font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent group-hover:from-accent group-hover:to-accent/70 transition-all duration-300">
            ByteeVolvr
          </span>
        </NavLink>
      }
      links={navLinks}
      centerElement={isShopRoute ? <ShopNavLinks /> : undefined}
      LinkComponent={NavLink}
      rightElement={
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 text-xs font-medium lg:border-r border-white/10 lg:pr-5">
            <a
              href={`mailto:${contact.email}`}
              className="group flex items-center gap-2 hover:text-white transition-all py-1.5 lg:py-1 px-3 rounded-full bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/10 text-brand-muted whitespace-nowrap"
            >
              <div className="p-1 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors shrink-0">
                <Mail className="h-3 w-3 text-accent" />
              </div>
              {contact.email}
            </a>
            <a
              href={`tel:${contact.phone.replace(/\s+/g, '')}`}
              className="group flex items-center gap-2 hover:text-white transition-all py-1.5 lg:py-1 px-3 rounded-full bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/10 text-brand-muted whitespace-nowrap"
            >
              <div className="p-1 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors shrink-0">
                <Phone className="h-3 w-3 text-accent" />
              </div>
              {contact.phone}
            </a>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:border-l border-white/10 lg:pl-5 pt-3 lg:pt-0 border-t lg:border-t-0">
            <Link
              to="/shop"
              className="relative group px-3 py-1.5 rounded-full overflow-hidden text-xs font-semibold text-white"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 border border-white/10 rounded-full group-hover:border-accent/50 transition-colors duration-300" />
              <span className="relative z-10 group-hover:text-accent transition-colors duration-300">
                Shop
              </span>
            </Link>

            {isShopRoute && (
              <>
                {user ? (
                  <Link
                    to="/shop/dashboard"
                    className="group flex items-center justify-center h-8 w-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/50 transition-all duration-300 text-white hover:text-accent"
                    title="Dashboard"
                  >
                    <User className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-300" />
                  </Link>
                ) : (
                  <Link
                    to="/shop/login"
                    className="group flex items-center justify-center h-8 w-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/50 transition-all duration-300 text-white hover:text-accent"
                    title="Sign In"
                  >
                    <User className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-300" />
                  </Link>
                )}
                <Link
                  to="/shop/cart"
                  className="group flex items-center justify-center h-8 w-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/50 transition-all duration-300 text-white hover:text-accent"
                  title="Cart"
                >
                  <div className="relative">
                    <ShoppingCart className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-300" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2.5 -right-2.5 bg-accent text-white text-[9px] font-bold h-4 min-w-[16px] px-0.5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(96,165,250,0.5)] border border-[#04080F]">
                        {itemCount}
                      </span>
                    )}
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      }
      mobileRightElement={
        isShopRoute ? (
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/shop/dashboard"
                className="text-white hover:text-accent transition-colors"
                title="Dashboard"
              >
                <User className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/shop/login"
                className="text-white hover:text-accent transition-colors"
                title="Sign In"
              >
                <User className="h-4 w-4" />
              </Link>
            )}
            <Link
              to="/shop/cart"
              className="text-white hover:text-accent transition-colors"
              title="Cart"
            >
              <div className="relative">
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        ) : null
      }
    />
  );
}
