
import React from 'react';
import PaymentMethodSection from '@/components/checkout/PaymentMethodSection';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';
import { Order, CardDetails, PixDetails } from '@/types/order';

interface PaymentMethodWrapperProps {
  paymentMethod: 'card' | 'pix';
  setPaymentMethod: React.Dispatch<React.SetStateAction<'card' | 'pix'>>;
  productDetails: ProductDetailsType;
  customerData: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    address?: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      postalCode: string;
    };
  };
  createOrder: (
    paymentId: string,
    status: 'pending' | 'confirmed',
    cardDetails?: CardDetails,
    pixDetails?: PixDetails
  ) => Promise<Order>;
  isProcessing: boolean;
}

const PaymentMethodWrapper: React.FC<PaymentMethodWrapperProps> = ({
  paymentMethod,
  setPaymentMethod,
  productDetails,
  customerData,
  createOrder,
  isProcessing
}) => {
  return (
    <PaymentMethodSection
      paymentMethod={paymentMethod}
      setPaymentMethod={setPaymentMethod}
      createOrder={createOrder}
      productDetails={productDetails}
      customerData={customerData}
      isProcessing={isProcessing}
    />
  );
};

export default PaymentMethodWrapper;
