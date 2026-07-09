import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/admin/LoginPage";
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from '@/pages/admin/DashboardPage';
import ProductsPage from '@/pages/admin/ProductsPage';
import VariantsPage from '@/pages/admin/VariantsPage';
import OrdersPage from '@/pages/admin/OrdersPage';
import PaymentsPage from '@/pages/admin/PaymentsPage';
import WorkshopVisitsPage from "./pages/admin/WorkshopVisitsPage";
import CorporateOrdersPage from "./pages/admin/CorporateOrdersPage";
import OffersPage from "./pages/admin/OffersPage";
import CollectionsPage from "./pages/admin/CollectionsPage";
import ForgotPasswordPage from "./pages/admin/ForgotPasswordPage";
import AdminManagementPage from "./pages/admin/AdminManagementPage";
// import PagesPage from "./pages/admin/PagesPage";
// import SettingsPage from "./pages/admin/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Admin Routes */}
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="admins" element={<AdminManagementPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="variants" element={<VariantsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="visits" element={<WorkshopVisitsPage />} />
              <Route path="offers" element={<OffersPage />} />
              <Route path="corporate" element={<CorporateOrdersPage />} />
              {/* <Route path="pages" element={<PagesPage />} />
              <Route path="settings" element={<SettingsPage />} /> */}
            </Route>
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
