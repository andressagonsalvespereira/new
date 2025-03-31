
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Payments from "@/pages/Payments";
import Checkout from "@/pages/Checkout";
import PaymentSettings from "@/pages/admin/PaymentSettings";
import Products from "@/pages/admin/Products";
import Orders from "@/pages/admin/Orders";
import QuickCheckout from "@/pages/QuickCheckout";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { AsaasProvider } from "@/contexts/AsaasContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { OrderProvider } from "@/contexts/OrderContext";

function App() {
  return (
    <AsaasProvider>
      <ProductProvider>
        <OrderProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/admin/settings/payment" element={<PaymentSettings />} />
              <Route path="/admin/products" element={<Products />} />
              <Route path="/admin/orders" element={<Orders />} />
              <Route path="/checkout/:slug" element={<Checkout />} />
              <Route path="/quick-checkout/:productId" element={<QuickCheckout />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </OrderProvider>
      </ProductProvider>
    </AsaasProvider>
  );
}

export default App;
