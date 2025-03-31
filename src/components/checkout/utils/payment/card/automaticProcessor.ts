
import { AutomaticProcessorParams } from './types';
import { simulatePayment } from '../paymentSimulator';

export const processAutomatic = async ({
  cardData,
  formState,
  settings,
  isSandbox,
  setPaymentStatus,
  setIsSubmitting,
  setError,
  navigate,
  toast,
  onSubmit,
  brand = 'Unknown',
  deviceType = 'desktop'
}: AutomaticProcessorParams) => {
  try {
    console.log("Processing automatic card payment with device type:", deviceType);
    
    // Simulate successful API payment processing
    const { success, paymentId, error } = await simulatePayment();
    
    if (!success) {
      throw new Error(error || 'Falha no processamento do pagamento');
    }
    
    setPaymentStatus('CONFIRMED');
    
    // Format the data for creating the order
    const orderData = {
      customer: formState.personalInfo,
      productId: formState.productId,
      productName: formState.productName,
      productPrice: formState.productPrice,
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'Pago',
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
        title: "Pagamento aprovado!",
        description: "Seu pagamento foi processado com sucesso.",
        duration: 5000,
      });
    }
    
    // Navigate to the success page
    setTimeout(() => {
      navigate('/payment-success', { 
        state: { 
          paymentId,
          productName: formState.productName,
          automatic: true 
        } 
      });
    }, 2000);
    
    return { success: true, paymentId };
  } catch (error) {
    console.error("Error in automatic card processing:", error);
    setError(error instanceof Error ? error.message : 'Falha ao processar pagamento');
    setIsSubmitting(false);
    
    // Navigate to failure page for persistent errors
    navigate('/payment-failed', { 
      state: { 
        productName: formState.productName,
        error: error instanceof Error ? error.message : 'Falha ao processar pagamento'
      } 
    });
    
    return { success: false, error: 'Falha ao processar pagamento' };
  }
};
