
import React from 'react';
import PaymentOptions from '@/components/checkout/payment-methods/PaymentOptions';
import PaymentError from '@/components/checkout/payment-methods/PaymentError';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import SimplifiedPixOption from '@/components/checkout/payment-methods/SimplifiedPixOption';
import PixPayment from '@/components/checkout/PixPayment';
import { adaptOrderCallback } from './paymentMethodUtils';
import { PaymentMethodType } from './usePaymentMethodLogic';

interface PaymentMethodContentProps {
  pixEnabled: boolean;
  cardEnabled: boolean;
  paymentMethod: PaymentMethodType;
  setPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethodType>>;
  settings: any;
  error: string | null;
  createOrder?: (
    paymentId: string, 
    status: 'pending' | 'confirmed',
    cardDetails?: any,
    pixDetails?: any
  ) => Promise<any>;
  isProcessing: boolean;
  productDetails?: any;
  customerData?: any;
  showPixPayment: boolean;
  setShowPixPayment: React.Dispatch<React.SetStateAction<boolean>>;
}

const PaymentMethodContent: React.FC<PaymentMethodContentProps> = ({
  pixEnabled,
  cardEnabled,
  paymentMethod,
  setPaymentMethod,
  settings,
  error,
  createOrder,
  isProcessing,
  productDetails,
  customerData,
  showPixPayment,
  setShowPixPayment
}) => {
  // Adapt callback functions for different payment components
  const { cardFormCallback, pixFormCallback } = adaptOrderCallback(createOrder);

  // Check if the product is digital
  const isDigitalProduct = productDetails?.isDigital || false;

  return (
    <div>
      {pixEnabled && cardEnabled && (
        <PaymentOptions 
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          settings={settings}
        />
      )}
      
      <PaymentError error={error} />
      
      {cardEnabled && paymentMethod === 'card' && (
        <CheckoutForm 
          onSubmit={cardFormCallback}
          isSandbox={settings.sandboxMode}
          isDigitalProduct={isDigitalProduct}
        />
      )}
      
      {pixEnabled && paymentMethod === 'pix' && !showPixPayment && (
        <SimplifiedPixOption 
          onSubmit={() => setShowPixPayment(true)} 
          isProcessing={isProcessing}
          productData={productDetails ? {
            productId: productDetails.id,
            productName: productDetails.name,
            productPrice: productDetails.price
          } : undefined}
          customerData={customerData}
        />
      )}
      
      {pixEnabled && paymentMethod === 'pix' && showPixPayment && (
        <PixPayment 
          onSubmit={pixFormCallback}
          isSandbox={settings.sandboxMode}
          isDigitalProduct={isDigitalProduct}
        />
      )}
    </div>
  );
};

export default PaymentMethodContent;
