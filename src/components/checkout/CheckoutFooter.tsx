
import React from 'react';
import { Shield, Lock, CreditCard, Award } from 'lucide-react';

const CheckoutFooter = () => {
  return (
    <footer className="bg-gray-100 py-6 border-t">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Políticas</h3>
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
                <a href="#" className="hover:underline">Dúvidas Frequentes</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-3">Segurança</h3>
            <div className="flex flex-wrap gap-2">
              <div className="bg-white px-3 py-2 rounded-md border flex items-center text-center">
                <Lock className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs">SSL Seguro</span>
              </div>
              
              <div className="bg-white px-3 py-2 rounded-md border flex items-center text-center">
                <CreditCard className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-xs">Pagamento Seguro</span>
              </div>
              
              <div className="bg-white px-3 py-2 rounded-md border flex items-center text-center">
                <Award className="h-4 w-4 text-yellow-600 mr-1" />
                <span className="text-xs">Compra Garantida</span>
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
