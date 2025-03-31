
import React from 'react';
import { Check, AlertCircle, Clock } from 'lucide-react';

interface PaymentStatusMessageProps {
  status: string;
}

const PaymentStatusMessage: React.FC<PaymentStatusMessageProps> = ({ status }) => {
  if (status === 'CONFIRMED' || status === 'APPROVED') {
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
  }
  
  if (status === 'PENDING' || status === 'AWAITING_PAYMENT' || status === 'ANALYSIS') {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Clock className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {status === 'ANALYSIS' ? 'Pagamento em Análise' : 'Pagamento em Processamento'}
        </h3>
        <p className="text-gray-600 mb-4">
          {status === 'ANALYSIS' 
            ? 'Seu pagamento foi enviado para análise. Em breve você receberá a confirmação.' 
            : 'Seu pagamento está sendo processado. Em breve você receberá a confirmação.'}
        </p>
      </div>
    );
  }
  
  if (status === 'DECLINED' || status === 'FAILED' || status === 'DENIED') {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Pagamento Recusado</h3>
        <p className="text-gray-600 mb-4">
          Infelizmente seu pagamento foi recusado. Por favor, verifique os dados do cartão ou tente outro método de pagamento.
        </p>
      </div>
    );
  }
  
  return null;
};

export default PaymentStatusMessage;
