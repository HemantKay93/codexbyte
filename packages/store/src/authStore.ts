import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  full_name?: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null, type: 'auth' | 'admin') => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAdmin: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ 
        user, 
        isAdmin: user?.role === 'admin' 
      }),

      setToken: (token, type) => {
        if (token) {
          localStorage.setItem(type === 'admin' ? 'admin_token' : 'auth_token', token);
        }
        set({ token });
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_token');
        set({ user: null, token: null, isAdmin: false });
      },

      initialize: () => {
        const adminToken = localStorage.getItem('admin_token');
        const authToken = localStorage.getItem('auth_token');
        const token = adminToken || authToken;
        set({ token, isAdmin: !!adminToken });
      }
    }),
    {
      name: 'byteevolvr-user-storage',
      partialize: (state) => ({ user: state.user, isAdmin: state.isAdmin }),
    }
  )
);
