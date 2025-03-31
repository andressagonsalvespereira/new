
import React, { useEffect, useState } from 'react';
import { CreditCard, QrCode, AlertCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import PixPayment from '@/components/checkout/PixPayment';
import { useAsaas } from '@/contexts/AsaasContext';
import { CardDetails, PixDetails } from '@/types/order';

interface PaymentMethodSectionProps {
  paymentMethod: 'card' | 'pix';
  setPaymentMethod: React.Dispatch<React.SetStateAction<'card' | 'pix'>>;
  createOrder?: (
    paymentId: string, 
    status: 'pending' | 'confirmed',
    cardDetails?: CardDetails,
    pixDetails?: PixDetails
  ) => Promise<void>;
}

const PaymentMethodSection = ({ 
  paymentMethod, 
  setPaymentMethod,
  createOrder
}: PaymentMethodSectionProps) => {
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
    // Exemplo de dados de cartão mascarados para armazenamento seguro
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

  if (!settings.isEnabled) {
    return (
      <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</div>
          <h2 className="font-medium text-lg">Pagamento</h2>
        </div>
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Pagamentos estão temporariamente indisponíveis.
          </AlertDescription>
        </Alert>
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
