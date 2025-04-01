
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
  handlePayment: () => void;
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

  const { createOrder, customerData } = useCheckoutContainerOrder({
    formState,
    productDetails,
    handlePayment
  });

  // Validate if the selected payment method is allowed based on settings
  React.useEffect(() => {
    if (settings) {
      // If the current payment method is not allowed, switch to an allowed method
      if (paymentMethod === 'card' && !settings.allowCreditCard) {
        if (settings.allowPix) {
          setPaymentMethod('pix');
        }
      } else if (paymentMethod === 'pix' && !settings.allowPix) {
        if (settings.allowCreditCard) {
          setPaymentMethod('card');
        }
      }
    }
  }, [settings, paymentMethod, setPaymentMethod]);

  return (
    <>
      <PersonalInfoWrapper 
        fullName={formState.fullName} 
        setFullName={setFullName}
        email={formState.email}
        setEmail={setEmail}
        cpf={formState.cpf}
        setCpf={setCpf}
        phone={formState.phone}
        setPhone={setPhone}
        formErrors={formState.formErrors}
      />
      
      <AddressSectionWrapper 
        cep={formState.cep}
        handleCepChange={handleCepChange}
        street={formState.street}
        setStreet={setStreet}
        number={formState.number}
        setNumber={setNumber}
        complement={formState.complement}
        setComplement={setComplement}
        neighborhood={formState.neighborhood}
        setNeighborhood={setNeighborhood}
        city={formState.city}
        setCity={setCity}
        state={formState.state}
        setState={setState}
        formErrors={formState.formErrors}
        isSearchingCep={isSearchingCep}
        isDigitalProduct={productDetails.isDigital}
        selectedShipping={formState.selectedShipping}
        setSelectedShipping={setSelectedShipping}
        deliveryEstimate={formState.deliveryEstimate}
      />
      
      <PaymentMethodWrapper 
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        createOrder={createOrder}
        productDetails={productDetails}
        customerData={customerData}
        isProcessing={isProcessing}
      />
      
      <OrderSummaryWrapper 
        productDetails={productDetails}
      />
    </>
  );
};

export default CheckoutProgressContainer;
