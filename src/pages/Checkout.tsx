
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import CheckoutSuccess from '@/components/checkout/CheckoutSuccess';
import CheckoutLayout from '@/components/checkout/CheckoutLayout';
import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import { getProductDetails } from '@/components/checkout/ProductDetails';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import { usePixel } from '@/contexts/PixelContext';

const Checkout = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const { trackPurchase } = usePixel();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { validateForm } = useCheckoutForm();
  const productDetails = getProductDetails(slug);

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
    
    // For manually processed payments, the success state is set in the CheckoutForm component
    // This is only for automatic payments or PIX
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Track purchase event
      trackPurchase({
        value: productDetails.price,
        transactionId: `order-${Date.now()}`,
        products: [{
          id: productDetails.id,
          name: productDetails.name,
          price: productDetails.price,
          quantity: 1
        }]
      });
      
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
    <CheckoutLayout>
      <CheckoutProgress
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        productDetails={productDetails}
        handlePayment={handlePayment}
        isProcessing={isProcessing}
      />
    </CheckoutLayout>
  );
};

export default Checkout;
