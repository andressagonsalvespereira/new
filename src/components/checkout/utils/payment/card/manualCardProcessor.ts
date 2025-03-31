
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CardFormData } from '../../../payment-methods/CardForm';
import { PaymentResult } from '../types';
import { randomId, simulateProcessingDelay } from '../common/paymentUtils';

export const handleManualCardProcessing = async (
  cardData: CardFormData,
  formState: any,
  navigate: ReturnType<typeof useNavigate>,
  setIsSubmitting: (isSubmitting: boolean) => void,
  setError: (error: string) => void,
  toast?: ReturnType<typeof useToast>['toast'],
  onSubmit?: (data: any) => void,
  brand?: string
): Promise<PaymentResult | void> => {
  try {
    console.log("Using manual card processing with data:", { 
      ...cardData, 
      // Não log o CVV completo nos logs
      cvv: '***'
    });
    
    // Armazenar o CVV completo (não mascarar aqui)
    const paymentData = {
      cardNumber: cardData.cardNumber.replace(/\s/g, ''),
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cvv: cardData.cvv, // Usar CVV completo
      cardName: cardData.cardName,
      paymentId: `pay_${randomId(10)}`,
      status: 'CONFIRMED',
      brand: brand || 'Desconhecida'
    };

    // Simular um pagamento bem-sucedido
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
    
    // Navegar para a página de sucesso
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
