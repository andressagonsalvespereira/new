
import React from 'react';
import PaymentMethodSection from '@/components/checkout/PaymentMethodSection';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';
import { Order, CardDetails, PixDetails } from '@/types/order';
import { usePaymentWrapper } from './hooks/usePaymentWrapper';

interface CustomerData {
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
}

export interface PaymentMethodWrapperProps {
  paymentMethod: 'card' | 'pix';
  setPaymentMethod: React.Dispatch<React.SetStateAction<'card' | 'pix'>>;
  productDetails: ProductDetailsType;
  customerData: CustomerData;
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
  const { handleOrderCreation } = usePaymentWrapper();

  return (
    <PaymentMethodSection
      paymentMethod={paymentMethod}
      setPaymentMethod={setPaymentMethod}
      createOrder={(paymentId, status, cardDetails, pixDetails) => 
        handleOrderCreation(paymentId, status, createOrder, cardDetails, pixDetails)
      }
      productDetails={productDetails}
      customerData={customerData}
      isProcessing={isProcessing}
    />
  );
};

export default PaymentMethodWrapper;
