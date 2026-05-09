import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '@byteevolvr/api-client';

interface AuthContextValue {
  user: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await AuthService.getCurrentAdmin();
          setUser(userData);
        } catch (err) {
          console.error('Failed to restore session:', err);
          AuthService.logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const data = await AuthService.adminLogin(email, password);
      const adminUser = data.admin || data.user;
      if (adminUser?.role !== 'admin' && adminUser?.role !== 'super-admin') {
        AuthService.logout();
        return { error: 'Admin access required' };
      }
      setUser(adminUser);
      return { error: null };
    } catch (err: any) {
      return { error: err.customMessage || 'Login failed' };
    }
  };

  const signOut = async () => {
    AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
