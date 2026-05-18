import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@byteevolvr/store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04080F]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-white/40 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
