
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingPayment: React.FC = () => {
  return (
    <div className="p-6 text-center">
      <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-500" />
      <p className="text-gray-600">Carregando opções de pagamento...</p>
    </div>
  );
};

export default LoadingPayment;
