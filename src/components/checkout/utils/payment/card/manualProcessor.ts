
import { ManualProcessorParams } from './types';
import { DeviceType } from '@/types/order';

// Function to generate a random payment ID
const generatePaymentId = () => {
  return 'pay_' + Math.random().toString(36).substr(2, 10);
};

export const processManual = async ({
  cardData,
  formState,
  navigate,
  setIsSubmitting,
  setError,
  toast,
  onSubmit,
  brand = 'Unknown',
  deviceType = 'desktop'
}: ManualProcessorParams) => {
  try {
    console.log("Processing manual card payment with device type:", deviceType);
    
    // Create a payment ID for manual payments
    const paymentId = generatePaymentId();
    
    // Format the data for creating the order
    const orderData = {
      customer: formState.personalInfo,
      productId: formState.productId,
      productName: formState.productName,
      productPrice: formState.productPrice,
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'Aguardando',
      paymentId,
      cardDetails: {
        number: cardData.cardNumber.replace(/\D/g, '').slice(-4).padStart(16, '*'),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        cvv: cardData.cvv,
        brand: brand
      },
      orderDate: new Date().toISOString(),
      deviceType
    };
    
    // Call the onSubmit function if provided (to create the order)
    if (onSubmit) {
      await onSubmit(orderData);
    }
    
    // Show success message
    if (toast) {
      toast({
        title: "Pagamento recebido!",
        description: "Seu pedido foi enviado para análise manual e será processado em breve.",
        duration: 5000,
      });
    }
    
    // Navigate to the success page
    navigate('/payment-success', { 
      state: { 
        paymentId,
        productName: formState.productName,
        manual: true 
      } 
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error in manual card processing:", error);
    setError('Falha ao processar pagamento manual. Por favor, tente novamente.');
    setIsSubmitting(false);
    return { success: false, error: 'Falha ao processar pagamento manual' };
  }
};
