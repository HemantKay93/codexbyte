import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { MainLayout } from '@/components/layout/MainLayout';

import { Loader2 } from 'lucide-react';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const ServicesPage = lazy(() =>
  import('@/pages/ServicesPage').then((m) => ({ default: m.ServicesPage }))
);
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() =>
  import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const PrivacyPolicy = lazy(() => import('@/pages/legal/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('@/pages/legal/RefundPolicy'));
const TermsAndConditions = lazy(() => import('@/pages/legal/TermsAndConditions'));
const ShopPage = lazy(() => import('@/pages/ShopPage').then((m) => ({ default: m.ShopPage })));
const ProductDetailPage = lazy(() =>
  import('@/features/shop/pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage }))
);
const CartPage = lazy(() =>
  import('@/features/shop/pages/CartPage').then((m) => ({ default: m.CartPage }))
);
const CheckoutPage = lazy(() =>
  import('@/features/shop/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);

// Shop Features
const LoginPage = lazy(() =>
  import('@/features/shop/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const SignupPage = lazy(() =>
  import('@/features/shop/pages/SignupPage').then((m) => ({ default: m.SignupPage }))
);
const DashboardPage = lazy(() =>
  import('@/features/shop/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const TrackingPage = lazy(() =>
  import('@/features/shop/pages/TrackingPage').then((m) => ({ default: m.TrackingPage }))
);
const OrderSuccessPage = lazy(() =>
  import('@/features/shop/pages/OrderSuccessPage').then((m) => ({ default: m.OrderSuccessPage }))
);
const OrderFailedPage = lazy(() =>
  import('@/features/shop/pages/OrderFailedPage').then((m) => ({ default: m.OrderFailedPage }))
);
const CategoryPage = lazy(() =>
  import('@/features/shop/pages/CategoryPage').then((m) => ({ default: m.CategoryPage }))
);

import { useEffect } from 'react';
import { useAuthStore } from '@byteevolvr/store';

import { ProtectedRoute } from '@/features/shop/components/ProtectedRoute';

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
    </div>
  );
}

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/legal/privacy" element={<PrivacyPolicy />} />
          <Route path="/legal/refund" element={<RefundPolicy />} />
          <Route path="/legal/terms" element={<TermsAndConditions />} />

          {/* Shop Routes */}
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/product/:id" element={<ProductDetailPage />} />
          <Route path="/shop/cart" element={<CartPage />} />
          <Route
            path="/shop/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="/shop/login" element={<LoginPage />} />
          <Route path="/shop/signup" element={<SignupPage />} />
          <Route path="/shop/track/:id?" element={<TrackingPage />} />
          <Route path="/shop/order-success" element={<OrderSuccessPage />} />
          <Route path="/shop/order-failed" element={<OrderFailedPage />} />
          <Route path="/shop/category/:id" element={<CategoryPage />} />
          <Route
            path="/shop/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
