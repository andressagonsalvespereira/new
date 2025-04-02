// ✅ checkout/payment/PaymentMethodContent.tsx
import React from 'react';
import PaymentOptions from '@/components/checkout/payment-methods/PaymentOptions';
import PaymentError from '@/components/checkout/payment-methods/PaymentError';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import SimplifiedPixOption from '@/components/checkout/payment-methods/SimplifiedPixOption';
import PixPayment from '@/components/checkout/PixPayment';
import { PaymentMethodType } from './usePaymentMethodLogic';
import { PaymentResult } from '@/components/checkout/payment/shared/types';
import { logger } from '@/utils/logger';

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
  const cardFormCallback = async (data: PaymentResult): Promise<any> => {
    if (!createOrder) return null;
    logger.log("Card form callback triggered");

    return await createOrder(
      data.paymentId || `card_${Date.now()}`,
      data.status === 'confirmed' ? 'confirmed' : 'pending',
      {
        number: data.cardNumber,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cvv: data.cvv,
        brand: data.brand || 'unknown'
      },
      undefined
    );
  };

  const pixFormCallback = async (data: PaymentResult): Promise<any> => {
    if (!createOrder) return null;
    logger.log("PIX form callback triggered");

    return await createOrder(
      data.paymentId || `pix_${Date.now()}`,
      'pending',
      undefined,
      {
        qrCode: data.qrCode,
        qrCodeImage: data.qrCodeImage,
        expirationDate: data.expirationDate
      }
    );
  };

  const handleShowPixPayment = (): Promise<PaymentResult> => {
    setShowPixPayment(true);
    return Promise.resolve({
      success: true,
      method: 'pix',
      status: 'pending',
      timestamp: new Date().toISOString()
    });
  };

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
          onSubmit={handleShowPixPayment} 
          isProcessing={isProcessing} 
          productData={productDetails ? {
            productId: productDetails.id,
            productName: productDetails.name,
            productPrice: productDetails.price
          } : undefined}
          customerData={customerData} 
          isSandbox={settings.sandboxMode || true} 
          isDigitalProduct={isDigitalProduct} 
        />
      )}

      {pixEnabled && paymentMethod === 'pix' && showPixPayment && (
        <PixPayment 
          onSubmit={pixFormCallback} 
          isSandbox={settings.sandboxMode || true} 
          isDigitalProduct={isDigitalProduct} 
          customerData={customerData} 
        />
      )}
    </div>
  );
};

export default PaymentMethodContent;
