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
// import CustomersPage from '@/pages/admin/CustomersPage';
import ProductFormPage from "./pages/admin/ProductFormPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import BrandsPage from "./pages/admin/BrandsPage";
import PagesPage from "./pages/admin/PagesPage";
import WorkshopVisitsPage from "./pages/admin/WorkshopVisitsPage";
import CorporateOrdersPage from "./pages/admin/CorporateOrdersPage";
import SettingsPage from "./pages/admin/SettingsPage";
import CollectionsPage from "./pages/admin/CollectionsPage";

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
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="variants" element={<VariantsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              {/* <Route path="customers" element={<CustomersPage />} /> */}
              <Route path="visits" element={<WorkshopVisitsPage />} />
              <Route path="corporate" element={<CorporateOrdersPage />} />
              {/* <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id/edit" element={<ProductFormPage />} />
              <Route path="brands" element={<BrandsPage />} />
              <Route path="pages" element={<PagesPage />} />
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
