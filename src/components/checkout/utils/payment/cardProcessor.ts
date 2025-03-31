
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CardFormData } from '../../payment-methods/CardForm';
import { PaymentProcessorProps } from './types';

/**
 * Processes a card payment - this file is kept for backward compatibility
 */
export const processCardPayment = async (
  cardData: CardFormData,
  props: PaymentProcessorProps,
  setError: (error: string) => void,
  setPaymentStatus: (status: string | null) => void,
  setIsSubmitting: (isSubmitting: boolean) => void,
  navigate: ReturnType<typeof useNavigate>,
  toast?: ReturnType<typeof useToast>['toast']
) => {
  // Import this dynamically to avoid circular dependencies
  const { processCardPayment: newProcessor } = await import('./card/cardProcessor');
  
  // Call the refactored implementation with the parameters as an object
  return newProcessor({
    cardData,
    props,
    setError,
    setPaymentStatus,
    setIsSubmitting,
    navigate,
    toast
  });
};
