
import React from 'react';

const CheckoutFooter = () => {
  return (
    <footer className="bg-gray-100 py-3 px-4 text-center text-xs text-gray-500">
      <p>&copy; {new Date().getFullYear()} - Todos os direitos reservados</p>
      <p>Powered by <span className="text-green-600">CheckoutSeguro</span></p>
    </footer>
  );
};

export default CheckoutFooter;
