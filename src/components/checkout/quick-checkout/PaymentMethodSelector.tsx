
import React from 'react';
import { PaymentMethod } from '@/types/order';
import { AsaasSettings } from '@/types/asaas';

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethod>>;
  settings: AsaasSettings;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ 
  paymentMethod, 
  setPaymentMethod, 
  settings 
}) => {
  return (
    <div className="flex space-x-4 mb-4">
      {settings.allowCreditCard && (
        <button
          className={`flex-1 py-2 px-4 rounded-md border ${
            paymentMethod === 'CREDIT_CARD' 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-gray-300 text-gray-700'
          }`}
          onClick={() => setPaymentMethod('CREDIT_CARD')}
        >
          Cartão de Crédito
        </button>
      )}
      
      {settings.allowPix && (
        <button
          className={`flex-1 py-2 px-4 rounded-md border ${
            paymentMethod === 'PIX' 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-gray-300 text-gray-700'
          }`}
          onClick={() => setPaymentMethod('PIX')}
        >
          PIX
        </button>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
