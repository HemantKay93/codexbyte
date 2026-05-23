import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { useAuthStore } from '@byteevolvr/store';
import { Loader2 } from 'lucide-react';

import './index.css';

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const ProductManagementPage = lazy(() =>
  import('./pages/ProductManagementPage').then((m) => ({ default: m.ProductManagementPage }))
);
const ProductFormPage = lazy(() =>
  import('./pages/ProductFormPage').then((m) => ({ default: m.ProductFormPage }))
);
const InventoryPage = lazy(() =>
  import('./pages/InventoryPage').then((m) => ({ default: m.InventoryPage }))
);
const OrderManagementPage = lazy(() =>
  import('./pages/OrderManagementPage').then((m) => ({ default: m.OrderManagementPage }))
);
const OrderDetailPage = lazy(() =>
  import('./pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage }))
);
const ReturnsPage = lazy(() =>
  import('./pages/ReturnsPage').then((m) => ({ default: m.ReturnsPage }))
);
const WarehousePage = lazy(() =>
  import('./pages/WarehousePage').then((m) => ({ default: m.WarehousePage }))
);
const CustomersPage = lazy(() =>
  import('./pages/CustomersPage').then((m) => ({ default: m.CustomersPage }))
);
const CustomerDetailPage = lazy(() =>
  import('./pages/CustomerDetailPage').then((m) => ({ default: m.CustomerDetailPage }))
);
const ReviewsPage = lazy(() =>
  import('./pages/ReviewsPage').then((m) => ({ default: m.ReviewsPage }))
);
const MarketingDashboard = lazy(() =>
  import('./modules/marketing/MarketingDashboard').then((m) => ({ default: m.MarketingDashboard }))
);
const CampaignBuilder = lazy(() =>
  import('./modules/marketing/CampaignBuilder').then((m) => ({ default: m.CampaignBuilder }))
);
const AudienceSegments = lazy(() =>
  import('./modules/marketing/AudienceSegments').then((m) => ({ default: m.AudienceSegments }))
);
const AutomationFlows = lazy(() =>
  import('./modules/marketing/AutomationFlows').then((m) => ({ default: m.AutomationFlows }))
);
const TemplateManager = lazy(() =>
  import('./modules/marketing/TemplateManager').then((m) => ({ default: m.TemplateManager }))
);
const DiscountsPage = lazy(() =>
  import('./pages/DiscountsPage').then((m) => ({ default: m.DiscountsPage }))
);
const CMSBuilderPage = lazy(() =>
  import('./pages/CMSBuilderPage').then((m) => ({ default: m.CMSBuilderPage }))
);
const InvoiceTemplatePage = lazy(() =>
  import('./pages/InvoiceTemplatePage').then((m) => ({ default: m.InvoiceTemplatePage }))
);
const SuppliersPage = lazy(() =>
  import('./pages/SuppliersPage').then((m) => ({ default: m.SuppliersPage }))
);
const MultiStorePage = lazy(() =>
  import('./pages/MultiStorePage').then((m) => ({ default: m.MultiStorePage }))
);
const POSPage = lazy(() => import('./pages/POSPage').then((m) => ({ default: m.POSPage })));
const TaxCompliancePage = lazy(() =>
  import('./pages/TaxCompliancePage').then((m) => ({ default: m.TaxCompliancePage }))
);
const ActivityLogPage = lazy(() =>
  import('./pages/ActivityLogPage').then((m) => ({ default: m.ActivityLogPage }))
);
const DevelopersPage = lazy(() =>
  import('./pages/DevelopersPage').then((m) => ({ default: m.DevelopersPage }))
);
const TeamPage = lazy(() => import('./pages/TeamPage').then((m) => ({ default: m.TeamPage })));
const SupportPage = lazy(() =>
  import('./pages/SupportPage').then((m) => ({ default: m.SupportPage }))
);
const WhatsAppDashboard = lazy(() =>
  import('./modules/whatsapp/WhatsAppDashboard').then((m) => ({ default: m.WhatsAppDashboard }))
);
const WhatsAppCampaigns = lazy(() =>
  import('./modules/whatsapp/WhatsAppCampaigns').then((m) => ({ default: m.WhatsAppCampaigns }))
);
const WhatsAppTasks = lazy(() =>
  import('./modules/whatsapp/WhatsAppTasks').then((m) => ({ default: m.WhatsAppTasks }))
);
const WhatsAppTemplates = lazy(() =>
  import('./modules/whatsapp/WhatsAppTemplates').then((m) => ({ default: m.WhatsAppTemplates }))
);

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background text-on-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const Main = () => {
  const { initialize } = useAuthStore();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/pos" element={<POSPage />} />
                <Route path="/products" element={<ProductManagementPage />} />
                <Route path="/products/new" element={<ProductFormPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/orders" element={<OrderManagementPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                <Route path="/warehouse" element={<WarehousePage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/:id" element={<CustomerDetailPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/marketing" element={<MarketingDashboard />} />
                <Route path="/marketing/campaigns" element={<CampaignBuilder />} />
                <Route path="/marketing/segments" element={<AudienceSegments />} />
                <Route path="/marketing/automations" element={<AutomationFlows />} />
                <Route path="/marketing/templates" element={<TemplateManager />} />
                <Route path="/discounts" element={<DiscountsPage />} />
                <Route path="/cms" element={<CMSBuilderPage />} />
                <Route path="/invoice-template" element={<InvoiceTemplatePage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/stores" element={<MultiStorePage />} />
                <Route path="/tax-compliance" element={<TaxCompliancePage />} />
                <Route path="/activity-log" element={<ActivityLogPage />} />
                <Route path="/developers" element={<DevelopersPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/whatsapp" element={<WhatsAppDashboard />} />
                <Route path="/whatsapp/campaigns" element={<WhatsAppCampaigns />} />
                <Route path="/whatsapp/tasks" element={<WhatsAppTasks />} />
                <Route path="/whatsapp/templates" element={<WhatsAppTemplates />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </AppErrorBoundary>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
