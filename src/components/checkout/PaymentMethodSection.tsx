
import React from 'react';
import { CreditCard, QrCode } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import PixPayment from '@/components/checkout/PixPayment';

interface PaymentMethodSectionProps {
  paymentMethod: 'card' | 'pix';
  setPaymentMethod: React.Dispatch<React.SetStateAction<'card' | 'pix'>>;
}

const PaymentMethodSection = ({ paymentMethod, setPaymentMethod }: PaymentMethodSectionProps) => {
  return (
    <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center mb-4">
        <div className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</div>
        <h2 className="font-medium text-lg">Pagamento</h2>
      </div>
      
      <div>
        <RadioGroup
          defaultValue="card"
          className="flex flex-col space-y-3 mb-4"
          onValueChange={(value) => setPaymentMethod(value as 'card' | 'pix')}
        >
          <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center cursor-pointer">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              <span>Cartão de Crédito</span>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="pix" id="pix" />
            <Label htmlFor="pix" className="flex items-center cursor-pointer">
              <QrCode className="h-5 w-5 mr-2 text-green-600" />
              <span>PIX</span>
            </Label>
          </div>
        </RadioGroup>
        
        {paymentMethod === 'card' && (
          <CheckoutForm onSubmit={() => {}} />
        )}
        
        {paymentMethod === 'pix' && (
          <PixPayment onSubmit={() => {}} />
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSection;
