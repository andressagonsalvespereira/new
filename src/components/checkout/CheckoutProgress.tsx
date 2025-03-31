
import React from 'react';
import PersonalInfoSection from '@/components/checkout/PersonalInfoSection';
import AddressSection from '@/components/checkout/AddressSection';
import PaymentMethodSection from '@/components/checkout/PaymentMethodSection';
import OrderSummarySection from '@/components/checkout/OrderSummarySection';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import { useOrders } from '@/contexts/OrderContext';
import { CreateOrderInput, CardDetails, PixDetails, PaymentMethod, PaymentStatus, Order } from '@/types/order';
import { useAsaas } from '@/contexts/AsaasContext';

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
  const { settings } = useAsaas();

  // Validate if the selected payment method is allowed based on settings
  React.useEffect(() => {
    if (!settings.loading) {
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

  const createOrder = async (
    paymentId: string, 
    status: 'pending' | 'confirmed',
    cardDetails?: CardDetails,
    pixDetails?: PixDetails
  ): Promise<Order> => {
    try {
      console.log("Criando pedido com dados do produto:", productDetails);
      
      const orderData: CreateOrderInput = {
        customer: {
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
        productId: productDetails.id,
        productName: productDetails.name,
        productPrice: productDetails.price,
        paymentMethod: paymentMethod === 'card' ? 'CREDIT_CARD' as PaymentMethod : 'PIX' as PaymentMethod,
        paymentStatus: status === 'pending' ? 'Aguardando' as PaymentStatus : 'Pago' as PaymentStatus,
        paymentId: paymentId,
        cardDetails,
        pixDetails,
        orderDate: new Date().toISOString()
      };

      console.log("Enviando dados do pedido:", orderData);
      const newOrder = await addOrder(orderData);
      console.log("Pedido criado:", newOrder);
      
      // Execute finalização da compra após processar o pagamento
      handlePayment();
      return newOrder;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  };

  const customerData = {
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
        customerData={customerData}
        isProcessing={isProcessing}
      />
      
      <OrderSummarySection 
        productDetails={productDetails}
      />
    </>
  );
};

export default CheckoutProgress;
