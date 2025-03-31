
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import PixPayment from '@/components/checkout/PixPayment';
import { useAsaas } from '@/contexts/AsaasContext';
import { CardDetails, Order, PixDetails } from '@/types/order';
import PaymentOptions from './payment-methods/PaymentOptions';
import PaymentError from './payment-methods/PaymentError';
import LoadingPayment from './payment-methods/LoadingPayment';
import SimplifiedPixOption from './payment-methods/SimplifiedPixOption';

interface ProductDetailsType {
  name: string;
  price: number;
  description: string;
  image: string;
  isDigital: boolean;
  id: string;
}

interface PaymentMethodSectionProps {
  paymentMethod: 'card' | 'pix';
  setPaymentMethod: React.Dispatch<React.SetStateAction<'card' | 'pix'>>;
  createOrder?: (
    paymentId: string, 
    status: 'pending' | 'confirmed',
    cardDetails?: CardDetails,
    pixDetails?: PixDetails
  ) => Promise<Order | void>;
  productDetails?: ProductDetailsType;
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
  const { settings, loading } = useAsaas();
  const [error, setError] = useState<string | null>(null);
  const [showPixPayment, setShowPixPayment] = useState(false);

  // Set default payment method based on available options
  useEffect(() => {
    if (!loading && settings.isEnabled) {
      if (!settings.allowPix && settings.allowCreditCard) {
        setPaymentMethod('card');
      } else if (settings.allowPix && !settings.allowCreditCard) {
        setPaymentMethod('pix');
      }
    }
  }, [loading, settings, setPaymentMethod]);

  const handleCardSubmit = async (data: any) => {
    // Example of masked card data for secure storage
    if (createOrder) {
      const cardDetails: CardDetails = {
        number: data.cardNumber.replace(/\d(?=\d{4})/g, '*'),
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cvv: '***',
        brand: data.brand || 'Visa'
      };
      
      await createOrder(
        data.paymentId || 'mock-payment-id', 
        data.status === 'CONFIRMED' ? 'confirmed' : 'pending',
        cardDetails
      );
    }
  };

  const handlePixSubmit = async (data: any) => {
    // Check if Asaas integration is enabled
    if (!settings.isEnabled && paymentMethod === 'pix') {
      if (createOrder) {
        // Se formos criar o pedido antes, faça isso aqui
        await createOrder(
          `pix-${Date.now()}`, 
          'pending',
          undefined,
          {
            qrCode: "PIX_CODE_PLACEHOLDER",
            qrCodeImage: "",
            expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        );
      }
      return;
    }
    
    if (createOrder) {
      const pixDetails: PixDetails = {
        qrCode: data.qrCode,
        qrCodeImage: data.qrCodeImage,
        expirationDate: data.expirationDate
      };
      
      await createOrder(
        data.paymentId || 'mock-payment-id', 
        'pending',
        undefined,
        pixDetails
      );
    }
  };

  // Handle PIX option click - show the PIX payment form
  const handlePixOptionClick = () => {
    if (settings.isEnabled) {
      setShowPixPayment(true);
    } else {
      handlePixSubmit({});
    }
  };

  if (loading) {
    return (
      <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</div>
          <h2 className="font-medium text-lg">Pagamento</h2>
        </div>
        <LoadingPayment />
      </div>
    );
  }

  // Preparar dados do produto para os componentes de pagamento
  const productData = productDetails ? {
    productId: productDetails.id,
    productName: productDetails.name,
    productPrice: productDetails.price
  } : undefined;

  // If Asaas is disabled, show simplified payment options
  if (!settings.isEnabled) {
    return (
      <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</div>
          <h2 className="font-medium text-lg">Pagamento</h2>
        </div>
        
        <PaymentOptions 
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          settings={settings}
        />
        
        <PaymentError error={error} />
        
        {paymentMethod === 'card' && (
          <CheckoutForm 
            onSubmit={handleCardSubmit}
            isSandbox={false}
          />
        )}
        
        {paymentMethod === 'pix' && !showPixPayment && (
          <SimplifiedPixOption 
            onSubmit={handlePixOptionClick} 
            isProcessing={isProcessing}
            productData={productData}
            customerData={customerData}
          />
        )}
        
        {paymentMethod === 'pix' && showPixPayment && (
          <PixPayment 
            onSubmit={handlePixSubmit}
            isSandbox={false}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center mb-4">
        <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</div>
        <h2 className="font-medium text-lg">Pagamento</h2>
      </div>
      
      <div>
        <PaymentOptions 
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          settings={settings}
        />
        
        <PaymentError error={error} />
        
        {settings.allowCreditCard && paymentMethod === 'card' && (
          <CheckoutForm 
            onSubmit={handleCardSubmit}
            isSandbox={settings.sandboxMode}
          />
        )}
        
        {settings.allowPix && paymentMethod === 'pix' && !showPixPayment && (
          <SimplifiedPixOption 
            onSubmit={handlePixOptionClick} 
            isProcessing={isProcessing}
            productData={productData}
            customerData={customerData}
          />
        )}
        
        {settings.allowPix && paymentMethod === 'pix' && showPixPayment && (
          <PixPayment 
            onSubmit={handlePixSubmit}
            isSandbox={settings.sandboxMode}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSection;
