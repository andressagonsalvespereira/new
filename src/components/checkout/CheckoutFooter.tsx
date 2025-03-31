
import React from 'react';

const CheckoutFooter = () => {
  return (
    <footer className="bg-gray-100 py-6 border-t">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} - Todos os direitos reservados</p>
          <p className="text-xs text-gray-500">Powered by <span className="text-green-600 font-medium">CheckoutSeguro</span></p>
        </div>
      </div>
    </footer>
  );
};

export default CheckoutFooter;
