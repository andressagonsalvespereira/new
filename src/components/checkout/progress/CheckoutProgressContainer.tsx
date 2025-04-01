
import React from 'react';
import PersonalInfoSection from '@/components/checkout/PersonalInfoSection';
import AddressSection from '@/components/checkout/AddressSection';
import PaymentMethodSection from '@/components/checkout/PaymentMethodSection';
import OrderSummarySection from '@/components/checkout/OrderSummarySection';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import { CreateOrderInput, CardDetails, PixDetails, PaymentMethod, PaymentStatus, Order } from '@/types/order';
import { useAsaas } from '@/contexts/AsaasContext';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/contexts/OrderContext';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';

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
  
  const { addOrder } = useOrders();
  const { settings } = useAsaas();
  const { toast } = useToast();

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

  const createOrder = async (
    paymentId: string, 
    status: 'pending' | 'confirmed',
    cardDetails?: CardDetails,
    pixDetails?: PixDetails
  ): Promise<Order> => {
    try {
      console.log("Creating order with product details:", productDetails);
      console.log("Order status:", status);
      console.log("Card details:", cardDetails ? {...cardDetails, cvv: '***'} : 'None');
      console.log("PIX details:", pixDetails || 'None');
      
      // Ensure that credit card brand is set to a default value if not provided
      if (cardDetails && !cardDetails.brand) {
        cardDetails.brand = 'Desconhecida';
      }
      
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
        orderDate: new Date().toISOString(),
        deviceType: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        isDigitalProduct: productDetails.isDigital
      };

      console.log("Sending order data:", {
        ...orderData,
        cardDetails: orderData.cardDetails ? {...orderData.cardDetails, cvv: '***'} : undefined
      });
      
      const newOrder = await addOrder(orderData);
      console.log("Order created successfully:", {
        id: newOrder.id,
        productName: newOrder.productName,
        productPrice: newOrder.productPrice,
        paymentMethod: newOrder.paymentMethod,
        paymentStatus: newOrder.paymentStatus
      });
      
      // Call the handlePayment function to complete the checkout process
      handlePayment();
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Erro no pedido",
        description: "Não foi possível finalizar o pedido. Tente novamente.",
        variant: "destructive",
      });
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

export default CheckoutProgressContainer;
