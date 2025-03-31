
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
import { useToast } from '@/hooks/use-toast';

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
  ) => Promise<Order>;
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
  const { toast } = useToast();
  const { settings } = useAsaas();
  const [error, setError] = useState<string | null>(null);
  const [showPixPayment, setShowPixPayment] = useState(false);

  useEffect(() => {
    if (settings) {
      const paymentConfigEnabled = settings.isEnabled || settings.manualPaymentConfig;
      const pixEnabled = paymentConfigEnabled && settings.allowPix;
      const cardEnabled = paymentConfigEnabled && settings.allowCreditCard;

      if (!pixEnabled && cardEnabled) {
        setPaymentMethod('card');
      } else if (pixEnabled && !cardEnabled) {
        setPaymentMethod('pix');
      }
    }
  }, [settings, setPaymentMethod]);

  const handleCardSubmit = async (data: any) => {
    if (createOrder) {
      try {
        // Ensure brand is always set
        const brand = data.brand || 'Desconhecida';
        
        const cardDetails: CardDetails = {
          number: data.cardNumber.replace(/\d(?=\d{4})/g, '*'),
          expiryMonth: data.expiryMonth,
          expiryYear: data.expiryYear,
          cvv: '***',
          brand: brand
        };
        
        console.log("Submitting card payment with brand:", brand);
        
        await createOrder(
          data.paymentId || 'mock-payment-id', 
          data.status === 'CONFIRMED' ? 'confirmed' : 'pending',
          cardDetails
        );
      } catch (error) {
        console.error("Error in handleCardSubmit:", error);
        setError('Erro ao processar pagamento com cartão. Por favor, tente novamente.');
        toast({
          title: "Erro no processamento",
          description: "Houve um problema ao processar o pagamento com cartão.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePixSubmit = async (data: any) => {
    if (!settings) {
      console.error("Settings not available");
      return;
    }
    
    const useManualPix = (!settings.isEnabled && settings.manualPaymentConfig) || 
                         (settings.isEnabled && settings.manualPixPage);
    
    if (useManualPix && paymentMethod === 'pix') {
      if (createOrder) {
        try {
          console.log("Creating order with manual PIX payment");
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
        } catch (error) {
          console.error("Error in handlePixSubmit (manual):", error);
          setError('Erro ao processar pagamento PIX. Por favor, tente novamente.');
          toast({
            title: "Erro no processamento",
            description: "Houve um problema ao processar o pagamento PIX.",
            variant: "destructive",
          });
        }
      }
      return;
    }
    
    if (createOrder) {
      try {
        console.log("Creating order with PIX payment data:", data);
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
      } catch (error) {
        console.error("Error in handlePixSubmit:", error);
        setError('Erro ao processar pagamento PIX. Por favor, tente novamente.');
        toast({
          title: "Erro no processamento",
          description: "Houve um problema ao processar o pagamento PIX.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePixOptionClick = () => {
    if (!settings) {
      console.error("Settings not available");
      return;
    }
    
    const useManualPix = (!settings.isEnabled && settings.manualPaymentConfig) || 
                         (settings.isEnabled && settings.manualPixPage);
    
    if (useManualPix) {
      console.log("Using manual PIX payment option");
      handlePixSubmit({});
    } else if (settings.isEnabled) {
      console.log("Showing PIX payment interface");
      setShowPixPayment(true);
    } else {
      console.log("Falling back to simple PIX payment");
      handlePixSubmit({});
    }
  };

  if (!settings) {
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

  const paymentConfigEnabled = settings.isEnabled || settings.manualPaymentConfig;
  const pixEnabled = paymentConfigEnabled && settings.allowPix;
  const cardEnabled = paymentConfigEnabled && settings.allowCreditCard;

  if (!pixEnabled && !cardEnabled) {
    return (
      <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</div>
          <h2 className="font-medium text-lg">Pagamento</h2>
        </div>
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Nenhum método de pagamento está habilitado. Por favor, contate o administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const productData = productDetails ? {
    productId: productDetails.id,
    productName: productDetails.name,
    productPrice: productDetails.price
  } : undefined;

  return (
    <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center mb-4">
        <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</div>
        <h2 className="font-medium text-lg">Pagamento</h2>
      </div>
      
      <div>
        {pixEnabled && cardEnabled && (
          <PaymentOptions 
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            settings={settings}
          />
        )}
        
        <PaymentError error={error} />
        
        {cardEnabled && paymentMethod === 'card' && (
          <CheckoutForm 
            onSubmit={handleCardSubmit}
            isSandbox={settings.sandboxMode}
          />
        )}
        
        {pixEnabled && paymentMethod === 'pix' && !showPixPayment && (
          <SimplifiedPixOption 
            onSubmit={handlePixOptionClick} 
            isProcessing={isProcessing}
            productData={productData}
            customerData={customerData}
          />
        )}
        
        {pixEnabled && paymentMethod === 'pix' && showPixPayment && (
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
