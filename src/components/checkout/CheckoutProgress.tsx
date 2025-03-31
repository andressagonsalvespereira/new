
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import PersonalInfoSection from '@/components/checkout/PersonalInfoSection';
import AddressSection from '@/components/checkout/AddressSection';
import PaymentMethodSection from '@/components/checkout/PaymentMethodSection';
import OrderSummarySection from '@/components/checkout/OrderSummarySection';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import { useOrders } from '@/contexts/OrderContext';
import { CreateOrderInput, CardDetails, PixDetails } from '@/types/order';

interface CheckoutProgressProps {
  paymentMethod: 'card' | 'pix';
  setPaymentMethod: React.Dispatch<React.SetStateAction<'card' | 'pix'>>;
  productDetails: ProductDetailsType;
  handlePayment: () => void;
  isProcessing: boolean;
}

interface ProductDetailsType {
  name: string;
  price: number;
  description: string;
  image: string;
  isDigital: boolean;
  id: string;
}

const CheckoutProgress: React.FC<CheckoutProgressProps> = ({
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
  
  const { addOrder } = useOrders();

  // Function to create order after successful payment
  const createOrder = async (
    paymentId: string, 
    status: 'pending' | 'confirmed',
    cardDetails?: CardDetails,
    pixDetails?: PixDetails
  ) => {
    try {
      const orderData: CreateOrderInput = {
        customer: {
          name: formState.fullName,
          email: formState.email,
          cpf: formState.cpf,
          phone: formState.phone,
          address: {
            street: formState.street,
            number: formState.number,
            complement: formState.complement,
            neighborhood: formState.neighborhood,
            city: formState.city,
            state: formState.state,
            postalCode: formState.cep.replace(/\D/g, '')
          }
        },
        productId: productDetails.id,
        productName: productDetails.name,
        productPrice: productDetails.price,
        paymentMethod,
        paymentStatus: status,
        paymentId,
        cardDetails,
        pixDetails
      };

      await addOrder(orderData);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
    }
  };

  return (
    <>
      <PersonalInfoSection 
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
      
      <AddressSection 
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
      
      <PaymentMethodSection 
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        createOrder={createOrder}
        productDetails={productDetails}
      />
      
      <OrderSummarySection 
        productDetails={productDetails}
        handlePayment={handlePayment}
        isProcessing={isProcessing}
      />
    </>
  );
};

export default CheckoutProgress;
