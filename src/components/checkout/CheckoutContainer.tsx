
import React from 'react';
import CheckoutHeader from './CheckoutHeader';
import CheckoutFooter from './CheckoutFooter';

interface CheckoutContainerProps {
  children: React.ReactNode;
}

const CheckoutContainer: React.FC<CheckoutContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutHeader />
      <main className="max-w-xl mx-auto py-6 px-4">
        {children}
      </main>
      <CheckoutFooter />
    </div>
  );
};

export default CheckoutContainer;
