
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
    logger.log("Payment settings:", { 
      useCustomProcessing: formState.useCustomProcessing, 
      manualCardStatus: formState.manualCardStatus,
      globalSettings: settings
    });
    
    // Detect card brand
    const brand = detectCardBrand(cardData.cardNumber);
    
    // Check if we should respect manual settings despite being in automatic mode
    // This allows product-specific or global manual settings to override automatic processing
    let resolvedStatus = 'CONFIRMED';
    const useCustomProcessing = formState.useCustomProcessing || false;
    const productManualStatus = formState.manualCardStatus;
    const globalManualStatus = settings.manualCardStatus;
    
    logger.log("Decision factors:", {
      productHasCustomProcessing: useCustomProcessing,
      productManualStatus: productManualStatus || "None",
      globalManualProcessing: settings.manualCardProcessing,
      globalManualStatus: globalManualStatus || "None"
    });
    
    // If product has custom processing enabled, respect its status
    if (useCustomProcessing && productManualStatus) {
      resolvedStatus = productManualStatus;
      logger.log("Using product-specific manual status:", resolvedStatus);
    } 
    // If global manual processing is enabled, respect global status
    else if (settings.manualCardProcessing && globalManualStatus) {
      resolvedStatus = globalManualStatus;
      logger.log("Using global manual status:", resolvedStatus);
    }
    
    // Log processing decisions
    logCardProcessingDecisions(
      useCustomProcessing,
      productManualStatus,
      globalManualStatus,
      resolvedStatus
    );
    
    // For declined payments, we should fail the transaction immediately
    if (resolvedStatus === 'DENIED') {
      logger.log("Payment automatically declined based on manual settings");
      throw new Error('Pagamento recusado pela operadora');
    }
    
    // Simulate successful API payment processing only if not denied
    const { success, paymentId, error } = await simulatePayment();
    
    if (!success) {
      throw new Error(error || 'Falha no processamento do pagamento');
    }
    
    setPaymentStatus(resolvedStatus);
    
    // Format the data for creating the order
    const orderData = {
      customer: formState.personalInfo,
      productId: formState.productId,
      productName: formState.productName,
      productPrice: formState.productPrice,
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: resolvedStatus,
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
    let orderResult;
    if (onSubmit) {
      orderResult = await onSubmit(orderData);
      logger.log("Order created through onSubmit callback:", orderResult);
    }
    
    // Show success message based on status
    if (resolvedStatus === 'APPROVED' || resolvedStatus === 'CONFIRMED') {
      toast({
        title: "Pagamento aprovado!",
        description: "Seu pagamento foi processado com sucesso.",
        duration: 5000,
      });
    } else if (resolvedStatus === 'ANALYSIS' || resolvedStatus === 'PENDING') {
      toast({
        title: "Pagamento em análise",
        description: "Seu pagamento está em análise pela operadora.",
        duration: 5000,
      });
    } else {
      toast({
        title: "Pagamento recebido",
        description: "Seu pagamento foi recebido e está sendo processado.",
        duration: 5000,
      });
    }
    
    // Determine which page to navigate to based on status
    const targetPage = resolvedStatus === 'DENIED' ? '/payment-failed' : '/payment-success';
    
    // Navigate to the success/analysis page with all relevant order data
    setTimeout(() => {
      navigate(targetPage, { 
        state: { 
          paymentId,
          productName: formState.productName,
          automatic: true,
          orderData: {
            productId: formState.productId,
            productName: formState.productName,
            productPrice: formState.productPrice,
            paymentMethod: 'CREDIT_CARD',
            paymentStatus: resolvedStatus,
            cardDetails: {
              brand,
              last4: cardData.cardNumber.replace(/\D/g, '').slice(-4)
            },
            customer: formState.personalInfo
          },
          order: orderResult
        } 
      });
    }, 1000);
    
    return { 
      success: true, 
      paymentId,
      method: 'card',
      status: resolvedStatus,
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
