
import React from 'react';
import { Shield, Lock, CreditCard, Award } from 'lucide-react';

const CheckoutFooter = () => {
  return (
    <footer className="bg-gray-100 py-6 border-t touch-manipulation">
      <div className="max-w-5xl mx-auto px-4">
        <div className="border-t border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} - Todos os direitos reservados</p>
          <p className="text-xs text-gray-500">Powered by <span className="text-green-600 font-medium">CheckoutSeguro</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
            <div className="flex flex-col space-y-2">
              <div className="bg-white px-2 py-1 rounded-md border inline-flex items-center text-xs w-fit">
                <Lock className="h-3 w-3 text-green-600 mr-1" />
                <span>SSL Seguro</span>
              </div>
              
              <div className="bg-white px-2 py-1 rounded-md border inline-flex items-center text-xs w-fit">
                <CreditCard className="h-3 w-3 text-blue-600 mr-1" />
                <span>Pagamento Seguro</span>
              </div>
              
              <div className="bg-white px-2 py-1 rounded-md border inline-flex items-center text-xs w-fit">
                <Award className="h-3 w-3 text-yellow-600 mr-1" />
                <span>Compra Garantida</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CheckoutFooter;
