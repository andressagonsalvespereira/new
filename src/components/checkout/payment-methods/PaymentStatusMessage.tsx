
import React from 'react';
import { Check } from 'lucide-react';

interface PaymentStatusMessageProps {
  status: string;
}

const PaymentStatusMessage: React.FC<PaymentStatusMessageProps> = ({ status }) => {
  if (status !== 'CONFIRMED') return null;
  
  return (
    <div className="p-6 text-center">
      <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
        <Check className="h-6 w-6 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Pagamento Aprovado</h3>
      <p className="text-gray-600 mb-4">
        Seu pagamento foi processado com sucesso. Obrigado pela sua compra!
      </p>
    </div>
  );
};

export default PaymentStatusMessage;
