import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';
import { useAuthStore } from '@byteevolvr/store';
import { AdminService } from '@byteevolvr/api-client';

import { useTheme } from '../contexts/ThemeContext';

import { Sidebar } from './Sidebar';

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function AdminLayout() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout: signOut } = useAuthStore();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [unreadCount, setUnreadCount] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    try {
      const data = await AdminService.getNotifications();
      setNotifications(data || []);
      setUnreadCount(data?.filter((n: any) => !n.is_read).length || 0);
      // eslint-disable-line @typescript-eslint/no-explicit-any
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchNotifications();
    const interval = setInterval(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchNotifications();
    }, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await AdminService.markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate('/login', { replace: true });
    // eslint-disable-line @typescript-eslint/no-floating-promises
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <X className="h-4 w-4 text-error" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? 'A';
  const displayName =
    user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';

  return (
    <div className="flex h-screen w-full bg-background font-sans text-on-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-6 z-30">
          <div className="flex flex-1 items-center">
            <div className="relative w-full max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-on-surface-variant" />
              </div>
              <input
                type="text"
                className="block w-full rounded-xl border-0 py-2 pl-10 pr-3 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant focus:bg-surface focus:ring-2 focus:ring-primary sm:text-sm transition-all"
                placeholder="Global search..."
              />
            </div>
          </div>

          <div className="ml-4 flex items-center gap-x-3">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className={`relative rounded-full p-2 transition-all ${notifMenuOpen ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-error text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-surface animate-in zoom-in">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-outline-variant bg-surface shadow-2xl py-0 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                    <h3 className="font-bold text-on-surface">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-on-surface-variant">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-10" />
                        <p className="text-sm font-medium">All caught up!</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.is_read && markAsRead(n.id)}
                          className={`p-4 border-b border-outline-variant last:border-0 cursor-pointer transition-all hover:bg-surface-container ${!n.is_read ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center ${n.priority === 'high' ? 'bg-error/10' : 'bg-surface-container-high'}`}
                            >
                              {getNotifIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-0.5">
                                <span
                                  className={`text-sm font-bold truncate ${!n.is_read ? 'text-on-surface' : 'text-on-surface-variant'}`}
                                >
                                  {n.title}
                                </span>
                                <span className="text-[10px] text-on-surface-variant whitespace-nowrap ml-2">
                                  {formatRelativeTime(new Date(n.created_at))}
                                </span>
                              </div>
                              <p
                                className={`text-xs leading-relaxed line-clamp-2 ${!n.is_read ? 'text-on-surface' : 'text-on-surface-variant'}`}
                              >
                                {n.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-outline-variant text-center bg-surface-container-low">
                    <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-2xl p-1 pr-3 hover:bg-surface-container transition-all"
              >
                <div className="h-9 w-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-sm">
                  {userInitial}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-on-surface leading-none mb-1 truncate max-w-[100px]">
                    {displayName}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-tighter text-on-surface-variant leading-none">
                    Administrator
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-on-surface-variant transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-outline-variant bg-surface shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/settings');
                      // eslint-disable-line @typescript-eslint/no-floating-promises
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-on-surface hover:bg-surface-container transition-all"
                  >
                    <User className="h-4 w-4 text-on-surface-variant" /> Profile
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/settings');
                      // eslint-disable-line @typescript-eslint/no-floating-promises
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-on-surface hover:bg-surface-container transition-all"
                  >
                    <Settings className="h-4 w-4 text-on-surface-variant" /> Settings
                  </button>
                  <div className="h-px bg-outline-variant my-1 mx-2" />
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-error hover:bg-error/10 transition-all"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
