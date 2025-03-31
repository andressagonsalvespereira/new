
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/admin/Dashboard";
import Customers from "@/pages/Customers";
import Payments from "@/pages/Payments";
import Checkout from "@/pages/Checkout";
import PaymentSettings from "@/pages/admin/PaymentSettings";
import Products from "@/pages/admin/Products";
import Orders from "@/pages/admin/Orders";
import PixelSettings from "@/pages/admin/PixelSettings";
import Login from "@/pages/admin/Login";
import QuickCheckout from "@/pages/QuickCheckout";
import PaymentFailed from "@/pages/PaymentFailed";
import PixPaymentManual from "@/pages/PixPaymentManual";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { AsaasProvider } from "@/contexts/AsaasContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { PixelProvider } from "@/contexts/PixelContext";
import { AuthProvider } from "@/contexts/AuthContext";
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";

function App() {
  return (
    <AsaasProvider>
      <ProductProvider>
        <OrderProvider>
          <Router>
            <AuthProvider>
              <PixelProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  
                  {/* Admin Auth Route */}
                  <Route path="/admin/login" element={<Login />} />
                  
                  {/* Admin Routes - with AdminLayout applied */}
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/customers" element={
                    <AdminLayout>
                      <Customers />
                    </AdminLayout>
                  } />
                  <Route path="/payments" element={
                    <AdminLayout>
                      <Payments />
                    </AdminLayout>
                  } />
                  <Route path="/admin/settings/payment" element={
                    <AdminLayout>
                      <PaymentSettings />
                    </AdminLayout>
                  } />
                  <Route path="/admin/pixel-settings" element={
                    <AdminLayout>
                      <PixelSettings />
                    </AdminLayout>
                  } />
                  <Route path="/admin/products" element={
                    <AdminLayout>
                      <Products />
                    </AdminLayout>
                  } />
                  <Route path="/admin/orders" element={
                    <AdminLayout>
                      <Orders />
                    </AdminLayout>
                  } />
                  
                  {/* Public Pages - with PublicLayout applied */}
                  <Route path="/checkout/:slug" element={
                    <PublicLayout>
                      <Checkout />
                    </PublicLayout>
                  } />
                  <Route path="/quick-checkout/:productId" element={
                    <PublicLayout>
                      <QuickCheckout />
                    </PublicLayout>
                  } />
                  <Route path="/payment-failed" element={
                    <PublicLayout>
                      <PaymentFailed />
                    </PublicLayout>
                  } />
                  <Route path="/pix-payment-manual" element={
                    <PublicLayout>
                      <PixPaymentManual />
                    </PublicLayout>
                  } />
                  
                  {/* Catch All */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </PixelProvider>
            </AuthProvider>
          </Router>
        </OrderProvider>
      </ProductProvider>
    </AsaasProvider>
  );
}

export default App;
