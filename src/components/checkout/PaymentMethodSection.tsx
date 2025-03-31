
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, QrCode, AlertCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import PixPayment from '@/components/checkout/PixPayment';
import { useAsaas } from '@/contexts/AsaasContext';
import { CardDetails, PixDetails } from '@/types/order';

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
  ) => Promise<void>;
  productDetails?: ProductDetailsType;
  customerData?: any;
}

const PaymentMethodSection = ({ 
  paymentMethod, 
  setPaymentMethod,
  createOrder,
  productDetails,
  customerData
}: PaymentMethodSectionProps) => {
  const navigate = useNavigate();
  const { settings, loading } = useAsaas();
  const [error, setError] = useState<string | null>(null);

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
      // If Asaas is disabled, redirect to manual PIX payment page
      navigate('/pix-payment-manual', {
        state: {
          customer: customerData,
          product: productDetails
        }
      });
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

  if (loading) {
    return (
      <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</div>
          <h2 className="font-medium text-lg">Pagamento</h2>
        </div>
        <div className="p-8 text-center">
          <p>Carregando opções de pagamento...</p>
        </div>
      </div>
    );
  }

  // If Asaas is disabled, show simplified payment options
  if (!settings.isEnabled) {
    return (
      <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</div>
          <h2 className="font-medium text-lg">Pagamento</h2>
        </div>
        
        <RadioGroup
          defaultValue={paymentMethod}
          className="flex flex-row space-x-3 mb-4"
          onValueChange={(value) => setPaymentMethod(value as 'card' | 'pix')}
        >
          <div className="flex-1 flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center cursor-pointer">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              <span>Cartão de Crédito</span>
            </Label>
          </div>
          
          <div className="flex-1 flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="pix" id="pix" />
            <Label htmlFor="pix" className="flex items-center cursor-pointer">
              <QrCode className="h-5 w-5 mr-2 text-green-600" />
              <span>PIX</span>
            </Label>
          </div>
        </RadioGroup>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {paymentMethod === 'card' && (
          <CheckoutForm 
            onSubmit={handleCardSubmit}
            isSandbox={false}
          />
        )}
        
        {paymentMethod === 'pix' && (
          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <QrCode className="h-16 w-16 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Pagamento via PIX</h3>
            <p className="text-gray-600 mb-4">
              Você será redirecionado para uma página de pagamento PIX após clicar no botão abaixo.
            </p>
            <button
              onClick={() => handlePixSubmit({})}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
            >
              Continuar para Pagamento PIX
            </button>
          </div>
        )}
      </div>
    );
  }

  const showRadioGroup = settings.allowPix && settings.allowCreditCard;

  return (
    <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center mb-4">
        <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</div>
        <h2 className="font-medium text-lg">Pagamento</h2>
      </div>
      
      <div>
        {showRadioGroup ? (
          <RadioGroup
            defaultValue={paymentMethod}
            className="flex flex-row space-x-3 mb-4"
            onValueChange={(value) => setPaymentMethod(value as 'card' | 'pix')}
          >
            {settings.allowCreditCard && (
              <div className="flex-1 flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center cursor-pointer">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  <span>Cartão de Crédito</span>
                </Label>
              </div>
            )}
            
            {settings.allowPix && (
              <div className="flex-1 flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix" className="flex items-center cursor-pointer">
                  <QrCode className="h-5 w-5 mr-2 text-green-600" />
                  <span>PIX</span>
                </Label>
              </div>
            )}
          </RadioGroup>
        ) : null}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {settings.allowCreditCard && paymentMethod === 'card' && (
          <CheckoutForm 
            onSubmit={handleCardSubmit}
            isSandbox={settings.isSandbox}
          />
        )}
        
        {settings.allowPix && paymentMethod === 'pix' && (
          <PixPayment 
            onSubmit={handlePixSubmit}
            isSandbox={settings.isSandbox}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSection;
