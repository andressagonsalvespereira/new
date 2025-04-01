
import { CardFormData } from '@/components/checkout/payment-methods/CardForm';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PaymentResult } from '../../types';
import { detectCardBrand } from '../cardDetection';
import { v4 as uuidv4 } from 'uuid';
import { DeviceType, PaymentStatus } from '@/types/order';
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
 * Processes manual card payment (test/sandbox mode)
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
    // Debug logs to help diagnose the issue
    logger.log("Using manual card processor with settings:", {
      manualCardStatus: settings.manualCardStatus,
      isDigitalProduct: formState.isDigitalProduct,
      productSpecificStatus: formState.useCustomProcessing ? formState.manualCardStatus : 'not set'
    });
    
    // Generate a mock payment ID for tracking
    const paymentId = `manual_${uuidv4()}`;
    
    // Define valid PaymentStatus values based on our type
    const STATUS_MAPPING = {
      'APPROVED': 'APPROVED' as PaymentStatus,
      'DENIED': 'DENIED' as PaymentStatus,
      'ANALYSIS': 'ANALYSIS' as PaymentStatus
    };
    
    // Determine payment status based on settings
    let paymentStatus: PaymentStatus = 'PENDING';
    
    // Check if we should use product-specific settings first (improved logic)
    if (formState.useCustomProcessing === true && formState.manualCardStatus) {
      // Normalize the status to ensure it's in our expected format
      const productStatus = formState.manualCardStatus.toUpperCase();
      paymentStatus = STATUS_MAPPING[productStatus as keyof typeof STATUS_MAPPING] || 'PENDING';
      logger.log("Using product-specific manual card status:", productStatus, "normalized to:", paymentStatus);
    } else if (settings.manualCardStatus) {
      // Use global setting but normalize it
      const globalStatus = settings.manualCardStatus.toUpperCase();
      paymentStatus = STATUS_MAPPING[globalStatus as keyof typeof STATUS_MAPPING] || 'PENDING';
      logger.log("Using global manual card status:", globalStatus, "normalized to:", paymentStatus);
    }
    
    // Log using the utility function with correct parameters
    const logResult = logCardProcessingDecisions(
      formState.useCustomProcessing === true,
      formState.manualCardStatus,
      settings.manualCardStatus
    );
    
    // Log the final payment status to be used
    logger.log("Final manual payment status decision:", paymentStatus, "Log result:", logResult);
    
    // Detect card brand
    const brand = detectCardBrand(cardData.cardNumber);
    
    // Prepare the payment result object
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
    
    // Submit the payment data to create an order
    logger.log("Submitting payment data to create order with status:", paymentStatus, {
      cardBrand: brand,
      cardNumber: '****' + cardData.cardNumber.slice(-4),
      timestamp: paymentResult.timestamp
    });
    
    // Call onSubmit and await the result
    const result = onSubmit ? await onSubmit(paymentResult) : null;
    logger.log("Order created with result:", result);
    
    // Determine where to navigate based on payment status
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
    
    logger.log(`Redirecting to ${getRedirectPath()} with payment status ${paymentStatus}`);
    
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
    logger.error('Error processing manual payment:', error);
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
      method: 'card',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'FAILED',
      timestamp: new Date().toISOString()
    };
  } finally {
    setIsSubmitting(false);
  }
}
