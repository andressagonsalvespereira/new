
import { CardFormData } from '../../../payment-methods/CardForm';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { AsaasSettings } from '@/types/asaas';
import { PaymentResult } from '../types';

interface ProcessManualParams {
  cardData: CardFormData;
  formState: any;
  navigate: ReturnType<typeof useNavigate>;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string) => void;
  toast: ReturnType<typeof useToast>['toast'];
  onSubmit: (data: any) => Promise<any>; // Make sure this returns a Promise
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
}: ProcessManualParams): Promise<PaymentResult> => {
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
    
    // Prepare the payment result object with the correct type for 'method'
    const paymentResult: PaymentResult = {
      success: true,
      method: 'card', // Explicitly using 'card' as the literal type
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
    
    // Call onSubmit and actually await the result
    const result = await onSubmit(paymentResult);
    console.log("Order created with result:", result);
    
    // Determine where to navigate based on payment status
    // Handle the case where result might be undefined
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
    
    // Helper function to determine redirect path based on status
    const getRedirectPath = () => {
      if (paymentStatus === 'DENIED') {
        return '/payment-failed';
      } else if (paymentStatus === 'APPROVED') {
        return '/payment-success';
      } else {
        // If status is ANALYSIS or any other, use success page but indicate it's in analysis
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
    
    // Show error toast
    toast({
      title: "Erro no processamento",
      description: "Ocorreu um erro ao processar seu pagamento. Tente novamente.",
      variant: "destructive",
      duration: 5000,
    });
    
    // Return a properly typed error result
    return {
      success: false,
      method: 'card', // Make sure it's the literal 'card'
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'FAILED',
      timestamp: new Date().toISOString()
    };
  } finally {
    setIsSubmitting(false);
  }
};
