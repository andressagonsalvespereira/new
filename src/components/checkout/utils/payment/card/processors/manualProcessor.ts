import { CardFormData } from '@/components/checkout/payment-methods/CardForm';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PaymentResult } from '../../types';
import { detectCardBrand } from '../cardDetection';
import { v4 as uuidv4 } from 'uuid';
import { DeviceType } from '@/types/order';
import { logger } from '@/utils/logger';
import { logCardProcessingDecisions } from '../cardProcessorLogs';

interface ProcessManualPaymentParams {
  cardData: CardFormData;
  formState: any;
  settings: any;
  deviceType: DeviceType;
  navigate: ReturnType<typeof useNavigate>;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string) => void;
  toast: ReturnType<typeof useToast>['toast'];
  onSubmit?: (data: any) => Promise<any> | any;
}

/**
 * Processa pagamento manual de cartão (modo de testes/sandbox)
 */
export async function processManualPayment({
  cardData,
  formState,
  settings,
  deviceType,
  navigate,
  setIsSubmitting,
  setError,
  toast,
  onSubmit
}: ProcessManualPaymentParams): Promise<PaymentResult> {
  setIsSubmitting(true);
  
  try {
    logger.log("Processamento manual com configurações:", {
      manualCardStatus: settings.manualCardStatus,
      isDigitalProduct: formState.isDigitalProduct
    });
    
    // Gera ID de pagamento simulado para rastreamento
    const paymentId = `manual_${uuidv4()}`;
    
    // Determina status do pagamento com base nas configurações
    let paymentStatus = 'PENDING';
    
    // Verifica se deve usar configurações específicas do produto primeiro
    if (formState.useCustomProcessing && formState.manualCardStatus) {
      paymentStatus = formState.manualCardStatus;
    } else if (settings.manualCardStatus) {
      paymentStatus = settings.manualCardStatus;
    }

    // Log the processing decisions
    logCardProcessingDecisions(
      formState.useCustomProcessing === true,
      formState.manualCardStatus,
      settings.manualCardStatus,
      paymentStatus
    );
    
    // Detecta bandeira do cartão
    const brand = detectCardBrand(cardData.cardNumber);
    
    // Prepara o objeto de resultado de pagamento
    const paymentResult: PaymentResult = {
      success: true,
      method: 'card',
      paymentId,
      status: paymentStatus,
      cardNumber: cardData.cardNumber.replace(/\s+/g, ''),
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cvv: cardData.cvv,
      brand,
      timestamp: new Date().toISOString(),
      deviceType
    };
    
    // Envia os dados de pagamento para criar um pedido
    logger.log("Enviando dados para criar pedido");
    
    // Chama onSubmit e aguarda o resultado
    const result = onSubmit ? await onSubmit(paymentResult) : null;
    logger.log("Pedido criado com sucesso");
    
    // Determina para onde navegar com base no status do pagamento
    const orderData = result ? {
      orderId: result.id,
      productName: result.productName,
      productPrice: result.productPrice,
      productId: result.productId,
      paymentMethod: result.paymentMethod,
      paymentStatus: paymentStatus
    } : {
      paymentStatus: paymentStatus
    };
    
    // Função auxiliar para determinar o caminho de redirecionamento com base no status
    const getRedirectPath = () => {
      if (paymentStatus === 'DENIED') {
        return '/payment-failed';
      } else if (paymentStatus === 'APPROVED') {
        return '/payment-success';
      } else {
        // Se o status for ANALYSIS ou qualquer outro, usa a página de sucesso mas indica que está em análise
        return '/payment-success';
      }
    };
    
    // Notificação toast com base no status
    if (paymentStatus !== 'DENIED') {
      toast({
        title: paymentStatus === 'APPROVED' ? "Payment Approved" : "Payment Under Review",
        description: paymentStatus === 'APPROVED' 
          ? "Your payment has been successfully approved!" 
          : "Your payment has been received and is under review.",
        duration: 5000,
        variant: "default"
      });
    } else {
      toast({
        title: "Payment Declined",
        description: "Your payment was declined. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
    
    // Navega para a página apropriada
    navigate(getRedirectPath(), { 
      state: { orderData }
    });
    
    return paymentResult;
  } catch (error) {
    logger.error('Erro no processamento manual:', error);
    setError('Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.');
    
    // Mostrar toast de erro
    toast({
      title: "Processing Error",
      description: "An error occurred while processing your payment. Please try again.",
      variant: "destructive",
      duration: 5000,
    });
    
    // Retorna um resultado de erro corretamente tipado
    return {
      success: false,
      method: 'card',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      status: 'FAILED',
      timestamp: new Date().toISOString()
    };
  } finally {
    setIsSubmitting(false);
  }
}
