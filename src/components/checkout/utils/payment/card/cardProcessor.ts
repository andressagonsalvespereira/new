
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CardFormData } from '../../../payment-methods/CardForm';
import { PaymentProcessorProps } from '../types';
import { detectCardBrand } from '../cardDetection';
import { validateCardData } from './validators';
import { CardProcessorParams } from './types';
import { processAutomatic } from './automaticProcessor';
import { processManual } from './manualProcessor';

/**
 * Detects if the user is on a mobile device
 */
const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};

/**
 * Processes a card payment using either automatic or manual processing
 */
export const processCardPayment = async ({
  cardData,
  props,
  setError,
  setPaymentStatus,
  setIsSubmitting,
  navigate,
  toast
}: CardProcessorParams) => {
  const { formState, settings, isSandbox, onSubmit } = props;
  
  // Validate card data
  const validationErrors = validateCardData(cardData);
  
  if (validationErrors) {
    // Display the first error found
    const firstError = Object.values(validationErrors)[0];
    setError(firstError || 'Verifique os dados do cartão');
    return;
  }
  
  setError('');
  setIsSubmitting(true);
  
  try {
    // Detect card brand early
    const brand = detectCardBrand(cardData.cardNumber);
    console.log("Card brand detected:", brand);
    
    // Detect device type
    const deviceType = isMobileDevice() ? 'mobile' : 'desktop';
    console.log("Order being placed from device type:", deviceType);
    
    // Check if manual card processing is enabled or if Asaas is disabled
    if (settings?.manualCardProcessing || !settings?.isEnabled) {
      console.log("Using manual card processing due to settings configuration:", 
        { manualCardProcessing: settings?.manualCardProcessing, isEnabled: settings?.isEnabled });
      
      return processManual({
        cardData,
        formState,
        navigate,
        setIsSubmitting,
        setError,
        toast,
        onSubmit,
        brand: brand || 'Unknown', // Ensure brand is a string
        deviceType
      });
    }
    
    return processAutomatic({
      cardData,
      formState,
      settings,
      isSandbox,
      setPaymentStatus,
      setIsSubmitting,
      setError,
      navigate,
      toast,
      onSubmit,
      brand: brand || 'Unknown', // Ensure brand is a string
      deviceType
    });
  } catch (error) {
    console.error('Erro geral ao processar pagamento:', error);
    setError('Erro ao processar pagamento. Por favor, tente novamente.');
    if (toast) {
      toast({
        title: "Erro no processamento",
        description: "Houve um problema ao processar o pagamento. Por favor, tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
    setIsSubmitting(false);
  }
};
