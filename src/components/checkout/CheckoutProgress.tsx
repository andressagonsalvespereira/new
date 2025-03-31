
import React from 'react';
import CheckoutProgressContainer from '@/components/checkout/progress/CheckoutProgressContainer';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';

interface CheckoutProgressProps {
  paymentMethod: 'card' | 'pix';
  setPaymentMethod: React.Dispatch<React.SetStateAction<'card' | 'pix'>>;
  productDetails: ProductDetailsType;
  handlePayment: () => void;
  isProcessing: boolean;
}

const CheckoutProgress: React.FC<CheckoutProgressProps> = (props) => {
  return <CheckoutProgressContainer {...props} />;
};

export default CheckoutProgress;
