import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppStore } from '@byteevolvr/store';
import { ShopLayout } from './components/ShopLayout';
import { Spinner } from '@byteevolvr/ui';

const ProductListingPage = React.lazy(() => import('./pages/ProductListingPage').then(m => ({ default: m.ProductListingPage })));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = React.lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrdersPage = React.lazy(() => import('./pages/OrdersPage').then(m => ({ default: m.OrdersPage })));
const TrackingPage = React.lazy(() => import('./pages/TrackingPage').then(m => ({ default: m.TrackingPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spinner size="lg" />
  </div>
);

import '@byteevolvr/ui/src/styles/theme.css';

const queryClient = new QueryClient();
const store = createAppStore();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <React.Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route element={<ShopLayout />}>
                  <Route path="/" element={<ProductListingPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/track" element={<TrackingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
              </Routes>
            </React.Suspense>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);
