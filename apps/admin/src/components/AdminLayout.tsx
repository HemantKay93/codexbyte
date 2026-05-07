import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Bell, Search, Sun, Moon, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export function AdminLayout() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  };

  // Derive initials from email
  const userInitial = user?.email?.charAt(0).toUpperCase() ?? 'A';
  const userEmail = user?.email ?? '';
  const displayName = user?.full_name || user?.user_metadata?.full_name || userEmail.split('@')[0] || 'Admin';

  return (
    <div className="flex h-screen w-full bg-background font-sans text-on-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-6">
          <div className="flex flex-1 items-center">
            <div className="relative w-full max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-on-surface-variant" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant focus:bg-surface focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-colors"
                placeholder="Search orders, products..."
              />
            </div>
          </div>

          <div className="ml-4 flex items-center gap-x-2">
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="rounded-full p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-full p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" />
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-error ring-2 ring-surface"></span>
            </button>

            {/* User Avatar + Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm select-none">
                  {userInitial}
                </div>
                <span className="hidden md:block text-sm font-medium text-on-surface max-w-[120px] truncate">{displayName}</span>
                <ChevronDown className={`h-4 w-4 text-on-surface-variant transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-outline-variant bg-surface shadow-dropdown py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-outline-variant">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg shrink-0">
                        {userInitial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-on-surface truncate">{displayName}</div>
                        <div className="text-xs text-on-surface-variant truncate">{userEmail}</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <User className="h-4 w-4 text-on-surface-variant" />
                      My Profile
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <Settings className="h-4 w-4 text-on-surface-variant" />
                      Settings
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-outline-variant pt-1">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
