// ✅ checkout/CheckoutProgressContainer.tsx
import React from 'react';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import { useAsaas } from '@/contexts/AsaasContext';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';
import PersonalInfoWrapper from './personal/PersonalInfoWrapper';
import AddressSectionWrapper from './address/AddressSectionWrapper';
import PaymentMethodWrapper from './payment/PaymentMethodWrapper';
import OrderSummaryWrapper from './order/OrderSummaryWrapper';
import { useCheckoutContainerOrder } from './hooks/useCheckoutContainerOrder';

interface CheckoutProgressContainerProps {
  paymentMethod: 'card' | 'pix';
  setPaymentMethod: React.Dispatch<React.SetStateAction<'card' | 'pix'>>;
  productDetails: ProductDetailsType;
  handlePayment: (paymentData: any) => void;
  isProcessing: boolean;
}

const CheckoutProgressContainer: React.FC<CheckoutProgressContainerProps> = ({
  paymentMethod,
  setPaymentMethod,
  productDetails,
  handlePayment,
  isProcessing
}) => {
  const {
    formState,
    isSearchingCep,
    setFullName,
    setEmail,
    setCpf,
    setPhone,
    setCep,
    setStreet,
    setNumber,
    setComplement,
    setNeighborhood,
    setCity,
    setState,
    setSelectedShipping,
    handleCepChange,
  } = useCheckoutForm();
  
  const { settings } = useAsaas();

  const handleOrderCreated = (paymentData: any) => {
    const paymentInfo = {
      customerData: {
        name: formState.fullName,
        email: formState.email,
        cpf: formState.cpf,
        phone: formState.phone,
        address: formState.street ? {
          street: formState.street,
          number: formState.number,
          complement: formState.complement,
          neighborhood: formState.neighborhood,
          city: formState.city,
          state: formState.state,
          postalCode: formState.cep.replace(/\D/g, '')
        } : undefined
      },
      status: paymentData.status || 'pending',
      ...paymentData
    };

    handlePayment(paymentInfo);
  };

  const { createOrder, customerData, isProcessing: isProcessingOrder } = useCheckoutContainerOrder({
    formState,
    productDetails,
    handlePayment: handleOrderCreated
  });

  React.useEffect(() => {
    if (settings) {
      if (paymentMethod === 'card' && !settings.allowCreditCard) {
        if (settings.allowPix) setPaymentMethod('pix');
      } else if (paymentMethod === 'pix' && !settings.allowPix) {
        if (settings.allowCreditCard) setPaymentMethod('card');
      }
    }
  }, [settings, paymentMethod, setPaymentMethod]);

  const combinedProcessing = isProcessing || isProcessingOrder;

  return (
    <>
      <PersonalInfoWrapper {...formState} {...{ setFullName, setEmail, setCpf, setPhone }} />

      <AddressSectionWrapper 
        {...formState} 
        isSearchingCep={isSearchingCep}
        handleCepChange={handleCepChange}
        isDigitalProduct={productDetails.isDigital}
        setStreet={setStreet} setNumber={setNumber} setComplement={setComplement}
        setNeighborhood={setNeighborhood} setCity={setCity} setState={setState}
        setSelectedShipping={setSelectedShipping}
      />

      <PaymentMethodWrapper 
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        createOrder={createOrder}
        productDetails={productDetails}
        customerData={customerData}
        isProcessing={combinedProcessing}
      />

      <OrderSummaryWrapper productDetails={productDetails} />
    </>
  );
};

export default CheckoutProgressContainer;
