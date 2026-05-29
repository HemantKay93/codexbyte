import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface NavLink {
  label: string;
  to: string;
  external?: boolean;
}

interface NavbarProps {
  logo: React.ReactNode;
  links: NavLink[];
  rightElement?: React.ReactNode;
  mobileRightElement?: React.ReactNode;
  LinkComponent: React.ComponentType<any>;
  // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function Navbar({
  logo,
  links,
  rightElement,
  mobileRightElement,
  LinkComponent,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'bg-[#04080F]/70 backdrop-blur-2xl py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-white/5'
          : 'bg-gradient-to-b from-[#04080F]/80 to-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-2">{logo}</div>

        {/* Desktop Links */}
        <div className="hidden items-center gap-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md px-3 py-1.5 lg:flex shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          {links.map((link) => (
            <LinkComponent
              key={link.label}
              to={link.to}
              className={({ isActive }: { isActive: boolean }) =>
                `relative px-5 py-2 text-sm font-medium transition-all duration-300 rounded-full overflow-hidden group ${
                  isActive ? 'text-white' : 'text-brand-muted hover:text-white'
                }`
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-bg"
                      className="absolute inset-0 bg-primary rounded-full shadow-[0_0_20px_rgba(26,79,214,0.4)]"
                      initial={false}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </>
              )}
            </LinkComponent>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">{rightElement}</div>

        <div className="flex items-center gap-4 lg:hidden">
          {mobileRightElement}
          {/* Mobile Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 lg:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/5 bg-[#04080F]/95 backdrop-blur-xl lg:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-8">
              {links.map((link) => (
                <LinkComponent
                  key={link.label}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }: { isActive: boolean }) =>
                    `text-lg font-medium transition-colors ${
                      isActive ? 'text-accent' : 'text-brand-muted hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </LinkComponent>
              ))}
              <div className="pt-4 border-t border-white/5">{rightElement}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
