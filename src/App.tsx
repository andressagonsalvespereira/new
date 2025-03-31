
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Payments from "@/pages/Payments";
import Checkout from "@/pages/Checkout";
import PaymentSettings from "@/pages/admin/PaymentSettings";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { AsaasProvider } from "@/contexts/AsaasContext";

function App() {
  return (
    <AsaasProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/admin/settings/payment" element={<PaymentSettings />} />
          <Route path="/checkout/:slug" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AsaasProvider>
  );
}

export default App;
