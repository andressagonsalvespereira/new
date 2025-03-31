
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';
import PersonalInfoSection from '@/components/checkout/PersonalInfoSection';
import AddressSection from '@/components/checkout/AddressSection';
import PaymentMethodSection from '@/components/checkout/PaymentMethodSection';
import OrderSummarySection from '@/components/checkout/OrderSummarySection';
import CheckoutSuccess from '@/components/checkout/CheckoutSuccess';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';

const Checkout = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
    handleCepChange,
    validateForm
  } = useCheckoutForm();

  const productDetails = {
    name: "Caneleira Gold",
    price: 59.90,
    description: 'Proteção premium para suas pernas',
    image: '/lovable-uploads/1664640d-4609-448d-9936-1d17bb6ed55a.png'
  };

  const handlePayment = () => {
    if (!validateForm()) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios",
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      toast({
        title: "Pagamento recebido",
        description: `Seu pagamento foi processado com sucesso.`,
        duration: 5000,
      });
    }, 1500);
  };

  if (isSuccess) {
    return <CheckoutSuccess productDetails={productDetails} />;
  }

  return (
    <CheckoutContainer>
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
      />
      
      <PaymentMethodSection 
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />
      
      <OrderSummarySection 
        productDetails={productDetails}
        handlePayment={handlePayment}
        isProcessing={isProcessing}
      />
    </CheckoutContainer>
  );
};

export default Checkout;
