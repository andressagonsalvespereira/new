
import React from 'react';
import { ShieldCheck, Lock, CreditCard } from 'lucide-react';

const CheckoutFooter = () => {
  return (
    <footer className="bg-gray-100 py-6 border-t">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-6 mb-4">
          <div className="flex items-center text-gray-600">
            <ShieldCheck className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-sm">100% Seguro</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Lock className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-sm">Dados Criptografados</span>
          </div>
          <div className="flex items-center text-gray-600">
            <CreditCard className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-sm">Pagamento Verificado</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="mb-2">
            <img 
              src="https://logodownload.org/wp-content/uploads/2018/09/mercado-pago-logo-1.png" 
              alt="Mercado Pago" 
              className="h-6 inline-block mx-1" 
            />
            <img 
              src="https://logodownload.org/wp-content/uploads/2020/02/pix-bc-logo.png" 
              alt="PIX" 
              className="h-5 inline-block mx-1" 
            />
            <img 
              src="https://logodownload.org/wp-content/uploads/2014/07/visa-logo-1.png" 
              alt="Visa" 
              className="h-4 inline-block mx-1" 
            />
            <img 
              src="https://logodownload.org/wp-content/uploads/2014/07/mastercard-logo-7.png" 
              alt="Mastercard" 
              className="h-5 inline-block mx-1" 
            />
          </div>
          
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} - Todos os direitos reservados</p>
          <p className="text-xs text-gray-500">Powered by <span className="text-green-600 font-medium">CheckoutSeguro</span></p>
        </div>
      </div>
    </footer>
  );
};

export default CheckoutFooter;
