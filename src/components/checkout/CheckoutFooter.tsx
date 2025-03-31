
import React from 'react';
import { Shield, Lock, CreditCard, Award } from 'lucide-react';

const CheckoutFooter = () => {
  return (
    <footer className="bg-gray-100 py-8 border-t">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold mb-4">Políticas e Segurança</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-center">
                <Shield className="h-3 w-3 mr-2 text-green-600" />
                <a href="#" className="hover:underline">Política de Privacidade</a>
              </li>
              <li className="flex items-center">
                <Shield className="h-3 w-3 mr-2 text-green-600" />
                <a href="#" className="hover:underline">Termos de Uso</a>
              </li>
              <li className="flex items-center">
                <Shield className="h-3 w-3 mr-2 text-green-600" />
                <a href="#" className="hover:underline">Política de Reembolso</a>
              </li>
              <li className="flex items-center">
                <Shield className="h-3 w-3 mr-2 text-green-600" />
                <a href="#" className="hover:underline">Dúvidas Frequentes</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4">Selos de Segurança</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-2 rounded-md border flex flex-col items-center justify-center text-center">
                <Lock className="h-6 w-6 text-green-600 mb-1" />
                <span className="text-xs font-medium">SSL Seguro</span>
              </div>
              
              <div className="bg-white p-2 rounded-md border flex flex-col items-center justify-center text-center">
                <CreditCard className="h-6 w-6 text-blue-600 mb-1" />
                <span className="text-xs font-medium">Pagamento Seguro</span>
              </div>
              
              <div className="bg-white p-2 rounded-md border flex flex-col items-center justify-center text-center">
                <Award className="h-6 w-6 text-yellow-600 mb-1" />
                <span className="text-xs font-medium">Compra Garantida</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-center">
              <div className="bg-gray-200 h-12 w-24 rounded-md flex items-center justify-center mr-2">
                <span className="text-xxs text-gray-600">SITE SEGURO</span>
              </div>
              <div className="bg-gray-200 h-12 w-24 rounded-md flex items-center justify-center">
                <span className="text-xxs text-gray-600">COMPRA PROTEGIDA</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} - Todos os direitos reservados</p>
          <p className="text-xs text-gray-500">Powered by <span className="text-green-600 font-medium">CheckoutSeguro</span></p>
        </div>
      </div>
    </footer>
  );
};

export default CheckoutFooter;
