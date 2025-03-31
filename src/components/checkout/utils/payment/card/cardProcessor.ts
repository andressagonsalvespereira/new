
import { CardFormData } from '../../../payment-methods/CardForm';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PaymentProcessorProps, PaymentResult } from '../types';
import { processManual } from './manualProcessor';
import { processAutomatic } from './automaticProcessor';

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
}: ProcessCardPaymentParams): Promise<PaymentResult | void> => {
  try {
    // Update browser detection for statistics
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    const deviceType = isMobileDevice ? 'mobile' : 'desktop';

    console.log("Processing card payment with settings:", { 
      manualCardProcessing: props.settings.manualCardProcessing,
      isDigitalProduct
    });

    // Check if manual card processing is enabled
    if (props.settings.manualCardProcessing) {
      console.log("Using manual card processing with digital product flag:", isDigitalProduct);
      return await processManual({
        cardData,
        formState: { 
          ...props.formState,
          isDigitalProduct
        },
        navigate,
        setIsSubmitting,
        setError,
        toast,
        onSubmit: props.onSubmit,
        brand: detectCardBrand(cardData.cardNumber),
        deviceType
      });
    } else {
      console.log("Using automatic card processing with digital product flag:", isDigitalProduct);
      return await processAutomatic({
        cardData,
        props: {
          ...props,
          formState: { 
            ...props.formState,
            isDigitalProduct
          }
        },
        setError,
        setPaymentStatus,
        setIsSubmitting,
        navigate,
        toast,
        deviceType
      });
    }
  } catch (error) {
    console.error('Error processing card payment:', error);
    setError('Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
    setIsSubmitting(false);
    throw error;
  }
};

// Simple card brand detection based on card number prefix
export const detectCardBrand = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\s+/g, '');
  
  if (/^4/.test(cleanNumber)) return 'Visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'American Express';
  if (/^6(?:011|5)/.test(cleanNumber)) return 'Discover';
  if (/^(?:2131|1800|35\d{3})/.test(cleanNumber)) return 'JCB';
  if (/^3(?:0[0-5]|[68])/.test(cleanNumber)) return 'Diners Club';
  if (/^(?:5[0678]\d\d|6304|6390|67\d\d)/.test(cleanNumber)) return 'Maestro';
  if (/^(606282\d{10}(\d{3})?)|(3841\d{15})/.test(cleanNumber)) return 'Hipercard';
  if (/^(4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67([0-6][0-9]|7[0-8])|9[0-8][0-9]{2})|627780|63(6297|6368)|650(03([^4])|04([0-9])|05(0|1)|4(0[5-9]|3[0-9]|8[5-9]|9[0-9])|5([0-2][0-9]|3[0-8])|9([2-6][0-9]|7[0-8])|541|700|720|901)|651652|655000|655021)/.test(cleanNumber)) return 'Elo';
  
  return 'Desconhecida';
};
