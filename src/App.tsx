import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { OrderProvider } from './contexts/OrderContext';
import { AsaasProvider } from './contexts/AsaasContext';
import { PixelProvider } from './contexts/PixelContext';
import { CheckoutCustomizationProvider } from './contexts/CheckoutCustomizationContext';

// Pages
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/admin/Products';
import NotFound from './pages/NotFound';
import Login from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import PaymentSettings from './pages/admin/PaymentSettings';
import PixelSettings from './pages/admin/PixelSettings';
import CheckoutCustomization from './pages/admin/CheckoutCustomization';
import Checkout from './pages/Checkout';
import PaymentFailed from './pages/PaymentFailed';
import PaymentSuccess from './pages/PaymentSuccess';
import PixPaymentManual from './pages/PixPaymentManual';

// Component imports
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <OrderProvider>
            <AsaasProvider>
              <PixelProvider>
                <CheckoutCustomizationProvider>
                  <Routes>
                    {/* Redirecionar página raiz para login admin (pode alterar para landing depois) */}
                    <Route path="/" element={<Navigate to="/admin/login" replace />} />

                    <Route path="/index" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/customers" element={<Customers />} />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<Login />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/products" element={<Products />} />
                    <Route path="/admin/orders" element={<Orders />} />
                    <Route path="/admin/settings/payment" element={<PaymentSettings />} />
                    <Route path="/admin/pixel-settings" element={<PixelSettings />} />
                    <Route path="/admin/checkout-customization" element={<CheckoutCustomization />} />
                    
                    {/* Redirecionamentos antigos */}
                    <Route path="/admin/asaas-settings" element={<Navigate to="/admin/settings/payment" replace />} />
                    <Route path="/admin/payments" element={<Navigate to="/admin/settings/payment" replace />} />
                    <Route path="/payments" element={<Navigate to="/admin/settings/payment" replace />} />

                    {/* Checkout Routes */}
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/checkout/:productSlug" element={<Checkout />} />
                    <Route path="/payment-failed" element={<PaymentFailed />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/pix-payment-manual" element={<PixPaymentManual />} />

                    {/* Redirecionamento de rota antiga */}
                    <Route path="/quick-checkout/:productId" element={<Navigate to="/checkout" replace />} />

                    {/* Rota de fallback */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </CheckoutCustomizationProvider>
              </PixelProvider>
            </AsaasProvider>
          </OrderProvider>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
