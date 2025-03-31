
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAsaas } from '@/contexts/AsaasContext';
import { useToast } from '@/hooks/use-toast';
import PaymentMethodSectionHeader from './PaymentMethodSection/PaymentMethodSectionHeader';
import PaymentMethodContent from './PaymentMethodSection/PaymentMethodContent';
import { usePaymentMethodLogic } from './PaymentMethodSection/usePaymentMethodLogic';
import LoadingPayment from './payment-methods/LoadingPayment';

interface PaymentMethodSectionProps {
  paymentMethod: 'card' | 'pix';
  setPaymentMethod: React.Dispatch<React.SetStateAction<'card' | 'pix'>>;
  createOrder?: (
    paymentId: string, 
    status: 'pending' | 'confirmed',
    cardDetails?: any,
    pixDetails?: any
  ) => Promise<any>;
  productDetails?: any;
  customerData?: any;
  isProcessing?: boolean;
}

const PaymentMethodSection = ({ 
  paymentMethod, 
  setPaymentMethod,
  createOrder,
  productDetails,
  customerData,
  isProcessing = false
}: PaymentMethodSectionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useAsaas();
  const [error, setError] = useState<string | null>(null);
  const [showPixPayment, setShowPixPayment] = useState(false);

  usePaymentMethodLogic(settings, setPaymentMethod);

  if (!settings) {
    return (
      <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
        <PaymentMethodSectionHeader />
        <LoadingPayment />
      </div>
    );
  }

  const paymentConfigEnabled = settings.isEnabled || settings.manualPaymentConfig;
  const pixEnabled = paymentConfigEnabled && settings.allowPix;
  const cardEnabled = paymentConfigEnabled && settings.allowCreditCard;

  if (!pixEnabled && !cardEnabled) {
    return (
      <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
        <PaymentMethodSectionHeader />
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Nenhum método de pagamento está habilitado. Por favor, contate o administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
      <PaymentMethodSectionHeader />
      <PaymentMethodContent 
        pixEnabled={pixEnabled}
        cardEnabled={cardEnabled}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        settings={settings}
        error={error}
        createOrder={createOrder}
        isProcessing={isProcessing}
        productDetails={productDetails}
        customerData={customerData}
        showPixPayment={showPixPayment}
        setShowPixPayment={setShowPixPayment}
      />
    </div>
  );
};

export default PaymentMethodSection;
