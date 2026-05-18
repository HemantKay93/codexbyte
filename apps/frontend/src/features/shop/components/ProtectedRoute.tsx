import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@byteevolvr/store';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/shop/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
