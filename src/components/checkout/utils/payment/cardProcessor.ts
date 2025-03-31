
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CardFormData } from '../../payment-methods/CardForm';
import { validateCardForm } from '../cardValidation';
import { PaymentProcessorProps, PaymentResult } from './types';
import { detectCardBrand } from './cardDetection';
import { handleManualCardProcessing, handleAutomaticCardProcessing } from './cardPaymentHandlers';

/**
 * Processa pagamento com cartão de crédito
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
  const { formState, settings, isSandbox, onSubmit } = props;
  
  // Validação do cartão
  const validationErrors = validateCardForm(
    cardData.cardName,
    cardData.cardNumber,
    cardData.expiryMonth,
    cardData.expiryYear,
    cardData.cvv
  );
  
  if (validationErrors) {
    // Exibir o primeiro erro encontrado
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
    
    // Verificar se o processamento manual de cartão está ativado
    if (settings.manualCardProcessing) {
      await handleManualCardProcessing(
        cardData,
        formState,
        navigate,
        setIsSubmitting,
        setError,
        toast,
        onSubmit,
        brand
      );
      return;
    }
    
    await handleAutomaticCardProcessing(
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
      brand
    );
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
