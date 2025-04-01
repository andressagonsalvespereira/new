
import { CardFormData } from '../../../payment-methods/CardForm';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { AsaasSettings } from '@/types/asaas';

interface ProcessManualParams {
  cardData: CardFormData;
  formState: any;
  navigate: ReturnType<typeof useNavigate>;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string) => void;
  toast: ReturnType<typeof useToast>['toast'];
  onSubmit: (data: any) => void;
  brand?: string;
  deviceType?: 'mobile' | 'desktop';
  settings: AsaasSettings;
}

export const processManual = async ({
  cardData,
  formState,
  navigate,
  setIsSubmitting,
  setError,
  toast,
  onSubmit,
  brand = 'Desconhecida',
  deviceType = 'desktop',
  settings
}: ProcessManualParams) => {
  setIsSubmitting(true);
  
  try {
    console.log("Using manual card processor with settings:", {
      manualCardStatus: settings.manualCardStatus,
      isDigitalProduct: formState.isDigitalProduct
    });
    
    // Generate a mock payment ID for tracking
    const paymentId = `manual_${uuidv4()}`;
    
    // Determine payment status based on settings
    let paymentStatus = 'PENDING';
    
    // Check if we should use product-specific settings first
    if (formState.useCustomProcessing && formState.manualCardStatus) {
      paymentStatus = formState.manualCardStatus;
      console.log("Using product-specific manual card status:", paymentStatus);
    } else if (settings.manualCardStatus) {
      paymentStatus = settings.manualCardStatus;
      console.log("Using global manual card status:", paymentStatus);
    }
    
    // Log the payment status to be used
    console.log("Manual payment will use status:", paymentStatus);
    
    // Prepare the payment result object
    const paymentResult = {
      success: true,
      method: 'card',
      paymentId,
      status: paymentStatus,
      cardNumber: cardData.cardNumber.replace(/\s+/g, ''),
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cvv: cardData.cvv,
      brand: brand,
      timestamp: new Date().toISOString(),
      deviceType
    };
    
    // Submit the payment data to create an order
    console.log("Submitting payment data to create order:", {
      ...paymentResult,
      cardNumber: '****' + paymentResult.cardNumber.slice(-4),
      cvv: '***'
    });
    
    const result = await onSubmit(paymentResult);
    console.log("Order created with result:", {
      orderId: result?.id,
      paymentStatus: result?.paymentStatus
    });
    
    // Determine where to navigate based on payment status
    const orderData = {
      orderId: result?.id,
      productName: result?.productName,
      productPrice: result?.productPrice,
      productId: result?.productId,
      paymentMethod: result?.paymentMethod,
      paymentStatus: paymentStatus
    };
    
    // Função auxiliar para determinar o caminho de redirecionamento baseado no status
    const getRedirectPath = () => {
      if (paymentStatus === 'DENIED') {
        return '/payment-failed';
      } else if (paymentStatus === 'APPROVED') {
        return '/payment-success';
      } else {
        // Se o status for ANALYSIS ou qualquer outro, use a página de sucesso mas indica que está em análise
        return '/payment-success';
      }
    };
    
    console.log(`Redirecting to ${getRedirectPath()} with payment status ${paymentStatus}`);
    
    // Toast notification based on status
    if (paymentStatus !== 'DENIED') {
      toast({
        title: paymentStatus === 'APPROVED' ? "Pagamento Aprovado" : "Pagamento em Análise",
        description: paymentStatus === 'APPROVED' 
          ? "Seu pagamento foi aprovado com sucesso!" 
          : "Seu pagamento foi recebido e está em análise.",
        duration: 5000,
      });
    } else {
      toast({
        title: "Pagamento Recusado",
        description: "Seu pagamento foi recusado. Por favor, tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
    
    // Navigate to the appropriate page
    navigate(getRedirectPath(), { 
      state: { orderData }
    });
    
    return paymentResult;
  } catch (error) {
    console.error('Error processing manual payment:', error);
    setError('Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.');
    
    // Mostrar toast de erro
    toast({
      title: "Erro no processamento",
      description: "Ocorreu um erro ao processar seu pagamento. Tente novamente.",
      variant: "destructive",
      duration: 5000,
    });
    
    throw error;
  } finally {
    setIsSubmitting(false);
  }
};
