
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { CardFormData } from '../../../payment-methods/CardForm';
import { simulatePayment } from '../paymentSimulator';
import { PaymentResult } from '../types';

interface ManualCardProcessorProps {
  cardData: CardFormData;
  formState: any;
  settings: any;
  setPaymentStatus: (status: string | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string) => void;
  navigate: ReturnType<typeof useNavigate>;
  toast?: ReturnType<typeof useToast>['toast'];
  onSubmit?: (data: any) => void;
}

export const processManualCard = async ({
  cardData,
  formState,
  settings,
  setPaymentStatus,
  setIsSubmitting,
  setError,
  navigate,
  toast,
  onSubmit
}: ManualCardProcessorProps): Promise<PaymentResult> => {
  try {
    console.log('Processando pagamento manual de cartão...');
    
    // Simular processamento de pagamento
    const { success, paymentId, error } = await simulatePayment();
    
    if (!success) {
      throw new Error(error || 'Falha ao processar pagamento manual');
    }
    
    // Atualizar status de pagamento para pendente (análise manual)
    setPaymentStatus('PENDING');
    
    // Formatação dos dados para criar o pedido
    const paymentData = {
      customer: formState.customer || formState.personalInfo,
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
        cvv: '***',
        brand: 'Manual'
      },
      orderDate: new Date().toISOString(),
      status: 'PENDING'
    };
    
    // Chamar a função onSubmit fornecida (para criar o pedido)
    if (onSubmit) {
      await onSubmit(paymentData);
    }
    
    // Exibir mensagem de sucesso
    if (toast) {
      toast({
        title: "Pagamento enviado para análise",
        description: "Seu pagamento foi enviado para análise e será processado em breve.",
        duration: 5000,
      });
    }
    
    // Redirecionar para a página de sucesso
    navigate('/payment-success', { 
      state: { 
        paymentId,
        productName: formState.productName,
        isManual: true 
      } 
    });
    
    return {
      success: true,
      method: 'card',
      paymentId,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      brand: 'Manual'
    };
  } catch (error) {
    console.error('Erro ao processar pagamento manual de cartão:', error);
    setError(error instanceof Error ? error.message : 'Erro ao processar pagamento manual');
    
    // Exibir mensagem de erro
    if (toast) {
      toast({
        title: "Erro no pagamento",
        description: error instanceof Error ? error.message : 'Erro ao processar pagamento manual',
        variant: "destructive",
        duration: 5000,
      });
    }
    return {
      success: false,
      error: 'Erro ao processar pagamento',
      method: 'card',
      status: 'FAILED',
      timestamp: new Date().toISOString()
    };
  } finally {
    setIsSubmitting(false);
  }
};
