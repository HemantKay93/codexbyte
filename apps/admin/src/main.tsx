import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages - Core
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LoginPage } from './pages/LoginPage';
import { SettingsPage } from './pages/SettingsPage';

// Pages - Catalog
import { ProductManagementPage } from './pages/ProductManagementPage';
import { ProductFormPage } from './pages/ProductFormPage';
import { InventoryPage } from './pages/InventoryPage';

// Pages - Orders
import { OrderManagementPage } from './pages/OrderManagementPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { ReturnsPage } from './pages/ReturnsPage';
import { WarehousePage } from './pages/WarehousePage';

// Pages - Customers
import { CustomersPage } from './pages/CustomersPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { ReviewsPage } from './pages/ReviewsPage';

// Pages - Marketing & Content
import { MarketingPage } from './pages/MarketingPage';
import { DiscountsPage } from './pages/DiscountsPage';
import { CMSBuilderPage } from './pages/CMSBuilderPage';
import { InvoiceTemplatePage } from './pages/InvoiceTemplatePage';

// Pages - Operations
import { SuppliersPage } from './pages/SuppliersPage';
import { MultiStorePage } from './pages/MultiStorePage';

// Pages - POS
import { POSPage } from './pages/POSPage';

// Pages - System
import { TaxCompliancePage } from './pages/TaxCompliancePage';
import { ActivityLogPage } from './pages/ActivityLogPage';
import { DevelopersPage } from './pages/DevelopersPage';
import { TeamPage } from './pages/TeamPage';
import { SupportPage } from './pages/SupportPage';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Core */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/pos" element={<POSPage />} />

            {/* Catalog */}
            <Route path="/products" element={<ProductManagementPage />} />
            <Route path="/products/new" element={<ProductFormPage />} />
            <Route path="/inventory" element={<InventoryPage />} />

            {/* Orders */}
            <Route path="/orders" element={<OrderManagementPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/warehouse" element={<WarehousePage />} />

            {/* Customers */}
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />

            {/* Marketing & Content */}
            <Route path="/marketing" element={<MarketingPage />} />
            <Route path="/discounts" element={<DiscountsPage />} />
            <Route path="/cms" element={<CMSBuilderPage />} />
            <Route path="/invoice-template" element={<InvoiceTemplatePage />} />

            {/* Operations */}
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/stores" element={<MultiStorePage />} />

            {/* System */}
            <Route path="/tax-compliance" element={<TaxCompliancePage />} />
            <Route path="/activity-log" element={<ActivityLogPage />} />
            <Route path="/developers" element={<DevelopersPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
