
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CardFormData } from '@/components/checkout/payment-methods/CardForm';
import { PaymentProcessorProps, PaymentResult } from '../shared/types';
import { detectCardBrand } from './utils/cardDetection';
import { v4 as uuidv4 } from 'uuid';
import { DeviceType } from '@/types/order';
import { logger } from '@/utils/logger';

interface ProcessCardPaymentParams {
  cardData: CardFormData;
  props: PaymentProcessorProps;
  setError: (error: string) => void;
  setPaymentStatus?: (status: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  navigate: ReturnType<typeof useNavigate>;
  toast: ReturnType<typeof useToast>['toast'];
  isDigitalProduct?: boolean;
}

export const processCardPayment = async ({
  cardData,
  props,
  setError,
  setPaymentStatus,
  setIsSubmitting,
  navigate,
  toast,
  isDigitalProduct = false
}: ProcessCardPaymentParams): Promise<PaymentResult> => {
  try {
    logger.log("processCardPayment iniciado - Processando pagamento", { 
      cardData: { 
        cardName: cardData.cardName,
        cardNumber: cardData.cardNumber ? `****${cardData.cardNumber.slice(-4)}` : '',
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear
      }
    });
    
    // Update browser detection for statistics
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    const deviceType: DeviceType = isMobileDevice ? 'mobile' : 'desktop';

    logger.log("Processing card payment with settings:", { 
      manualCardProcessing: props.settings.manualCardProcessing,
      manualCardStatus: props.settings.manualCardStatus,
      isDigitalProduct
    });

    // Determine which processor to use based on settings
    if (props.settings.manualCardProcessing) {
      logger.log("Using manual card processing with digital product flag:", isDigitalProduct);
      return await processManualPayment({
        cardData,
        formState: { 
          ...props.formState,
          isDigitalProduct
        },
        settings: props.settings,
        deviceType,
        navigate,
        setIsSubmitting,
        setError,
        toast,
        onSubmit: props.onSubmit
      });
    } else {
      logger.log("Using automatic card processing with digital product flag:", isDigitalProduct);
      return await processAutomaticPayment({
        cardData,
        formState: { 
          ...props.formState,
          isDigitalProduct
        },
        settings: props.settings,
        isSandbox: props.isSandbox,
        deviceType,
        setPaymentStatus,
        setIsSubmitting,
        setError,
        navigate,
        toast,
        onSubmit: props.onSubmit
      });
    }
  } catch (error) {
    logger.error('Error processing card payment:', error);
    setError('Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
    setIsSubmitting(false);
    
    // Return a valid PaymentResult object in case of error
    return {
      success: false,
      method: 'card',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'FAILED',
      timestamp: new Date().toISOString()
    };
  }
};

// Private functions for internal processing

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

async function processManualPayment({
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
    logger.log("Using manual card processor with settings:", {
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
      logger.log("Using product-specific manual card status:", paymentStatus);
    } else if (settings.manualCardStatus) {
      paymentStatus = settings.manualCardStatus;
      logger.log("Using global manual card status:", paymentStatus);
    }
    
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
    logger.log("Submitting payment data to create order");
    
    // Call onSubmit and await the result
    const result = onSubmit ? await onSubmit(paymentResult) : null;
    logger.log("Order created successfully");
    
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

async function processAutomaticPayment({
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
    const paymentId = `automatic_${uuidv4()}`;
    const success = true;
    
    if (!success) {
      throw new Error('Falha no processamento do pagamento');
    }
    
    setPaymentStatus('CONFIRMED');
    
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
