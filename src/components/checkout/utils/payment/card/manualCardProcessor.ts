
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

// Define status para processamento manual
export enum ManualCardStatus {
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  ANALYSIS = 'ANALYSIS'
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
    console.log('Configurações de status do cartão:', settings?.manualCardStatus);
    
    // Verificar configuração de status manual (padrão: análise)
    const manualCardStatus = settings?.manualCardStatus || ManualCardStatus.ANALYSIS;
    console.log('Status configurado para pagamento manual:', manualCardStatus);
    
    // Simular processamento de pagamento
    const { success, paymentId, error } = await simulatePayment();
    
    if (!success) {
      throw new Error(error || 'Falha ao processar pagamento manual');
    }
    
    // Definir o status com base na configuração
    let paymentStatus = 'PENDING';
    let redirectPath = '/payment-success';
    
    switch (manualCardStatus) {
      case ManualCardStatus.APPROVED:
        paymentStatus = 'CONFIRMED';
        redirectPath = '/payment-success';
        break;
      case ManualCardStatus.DENIED:
        paymentStatus = 'DECLINED';
        redirectPath = '/payment-failed';
        break;
      case ManualCardStatus.ANALYSIS:
      default:
        paymentStatus = 'PENDING';
        redirectPath = '/payment-success';
        break;
    }
    
    // Atualizar status de pagamento
    setPaymentStatus(paymentStatus);
    
    // Formatação dos dados para criar o pedido
    const paymentData = {
      customer: formState.customer || formState.personalInfo,
      productId: formState.productId,
      productName: formState.productName,
      productPrice: formState.productPrice,
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: paymentStatus === 'CONFIRMED' ? 'Pago' : 
                    paymentStatus === 'DECLINED' ? 'Cancelado' : 'Aguardando',
      paymentId,
      cardDetails: {
        number: cardData.cardNumber.replace(/\D/g, '').slice(-4).padStart(16, '*'),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        cvv: '***',
        brand: 'Manual'
      },
      orderDate: new Date().toISOString(),
      status: paymentStatus
    };
    
    // Chamar a função onSubmit fornecida (para criar o pedido)
    if (onSubmit) {
      await onSubmit(paymentData);
    }
    
    // Exibir mensagem de sucesso
    if (toast) {
      let toastMessage = "";
      let toastTitle = "";
      
      switch (manualCardStatus) {
        case ManualCardStatus.APPROVED:
          toastTitle = "Pagamento aprovado";
          toastMessage = "Seu pagamento foi aprovado com sucesso.";
          break;
        case ManualCardStatus.DENIED:
          toastTitle = "Pagamento recusado";
          toastMessage = "Seu pagamento foi recusado.";
          break;
        case ManualCardStatus.ANALYSIS:
        default:
          toastTitle = "Pagamento enviado para análise";
          toastMessage = "Seu pagamento foi enviado para análise e será processado em breve.";
          break;
      }
      
      toast({
        title: toastTitle,
        description: toastMessage,
        duration: 5000,
      });
    }
    
    // Redirecionar para a página apropriada com os dados corretos
    navigate(redirectPath, { 
      state: { 
        orderData: {
          paymentId,
          productId: formState.productId,
          productName: formState.productName,
          productPrice: formState.productPrice,
          paymentMethod: 'CREDIT_CARD',
          paymentStatus: paymentStatus
        },
        isManual: true 
      } 
    });
    
    return {
      success: true,
      method: 'card',
      paymentId,
      status: paymentStatus,
      timestamp: new Date().toISOString(),
      brand: 'Manual'
    };
  } catch (error) {
    console.error('Erro ao processar pagamento manual de cartão:', error);
    setError(error instanceof Error ? error.message : 'Erro ao processar pagamento manual');
    
    // Exibir mensagem de erro
    if (toast) {
      toast({
        title: "Erro no processamento",
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
