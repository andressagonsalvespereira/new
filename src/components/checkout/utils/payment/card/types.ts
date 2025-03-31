
import { CardFormData } from '../../../payment-methods/CardForm';
import { PaymentProcessorProps } from '../types';

export interface CardProcessorParams {
  cardData: CardFormData;
  props: PaymentProcessorProps;
  setError: (error: string) => void;
  setPaymentStatus: (status: string | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  navigate: any;
  toast?: any;
}
