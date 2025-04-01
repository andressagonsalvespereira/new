import { CardFormData } from '@/components/checkout/payment-methods/CardForm';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PaymentProcessorProps, PaymentResult } from '../../types';
import { detectCardBrand } from '../cardDetection';
import { simulatePayment } from '../../paymentSimulator';
import { DeviceType } from '@/types/order';
import { logger } from '@/utils/logger';
import { logCardProcessingDecisions } from '../cardProcessorLogs';

interface ProcessAutomaticPaymentParams {
  cardData: CardFormData;
  formState: any;
  settings: any;
  isSandbox: boolean;
  deviceType: DeviceType;
  setPaymentStatus?: (status: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string) => void;
  navigate: ReturnType<typeof useNavigate>;
  toast: ReturnType<typeof useToast>['toast'];
  onSubmit?: (data: any) => Promise<any> | any;
}

/**
 * Processes automatic card payment (production mode)
 */
export async function processAutomaticPayment({
  cardData,
  formState,
  settings,
  isSandbox,
  deviceType,
  setPaymentStatus = () => {},
  setIsSubmitting,
  setError,
  navigate,
  toast,
  onSubmit
}: ProcessAutomaticPaymentParams): Promise<PaymentResult> {
  try {
    logger.log("Processing automatic card payment with device type:", deviceType);
    
    // Detect card brand
    const brand = detectCardBrand(cardData.cardNumber);
    
    // Simulate successful API payment processing
    const { success, paymentId, error } = await simulatePayment();
    
    if (!success) {
      throw new Error(error || 'Falha no processamento do pagamento');
    }
    
    // For automatic processing, we always confirm immediately
    const resolvedStatus = 'CONFIRMED';
    setPaymentStatus(resolvedStatus);
    
    // Log processing decisions
    logCardProcessingDecisions(
      false, // automatic processing is not custom
      undefined, // no product manual status
      settings.manualCardStatus,
      resolvedStatus
    );
    
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
        brand
      },
      orderDate: new Date().toISOString(),
      deviceType,
      isDigitalProduct: formState.isDigitalProduct
    };
    
    // Call the onSubmit function if provided (to create the order)
    if (onSubmit) {
      await onSubmit(orderData);
    }
    
    // Show success message
    toast({
      title: "Pagamento aprovado!",
      description: "Seu pagamento foi processado com sucesso.",
      duration: 5000,
    });
    
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
    
    return { 
      success: true, 
      paymentId,
      method: 'card',
      status: 'CONFIRMED',
      timestamp: new Date().toISOString() 
    };
  } catch (error) {
    logger.error("Error in automatic card processing:", error);
    setError(error instanceof Error ? error.message : 'Falha ao processar pagamento');
    setIsSubmitting(false);
    
    // Navigate to failure page for persistent errors
    navigate('/payment-failed', { 
      state: { 
        productName: formState.productName,
        error: error instanceof Error ? error.message : 'Falha ao processar pagamento'
      } 
    });
    
    return { 
      success: false, 
      error: 'Falha ao processar pagamento',
      method: 'card',
      status: 'FAILED',
      timestamp: new Date().toISOString()
    };
  }
}
