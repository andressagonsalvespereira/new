
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CardFormData } from '../../payment-methods/CardForm';
import { formatCardNumber, validateCardForm } from '../cardValidation';
import { PaymentProcessorProps, PaymentResult } from './types';
import { simulateCardPayment, simulateCustomerCreation } from './paymentSimulator';

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
  toast: ReturnType<typeof useToast>['toast']
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
  
  // Verificar se o processamento manual de cartão está ativado
  if (settings.manualCardProcessing) {
    return handleManualCardProcessing(
      cardData,
      formState,
      navigate,
      setIsSubmitting,
      setError,
      toast
    );
  }
  
  return handleAutomaticCardProcessing(
    cardData,
    formState,
    settings,
    isSandbox,
    setPaymentStatus,
    setIsSubmitting,
    setError,
    toast,
    onSubmit
  );
};

/**
 * Processa pagamento com cartão de forma manual
 */
const handleManualCardProcessing = async (
  cardData: CardFormData,
  formState: any,
  navigate: ReturnType<typeof useNavigate>,
  setIsSubmitting: (isSubmitting: boolean) => void,
  setError: (error: string) => void,
  toast: ReturnType<typeof useToast>['toast']
) => {
  try {
    // Preparar dados para a página de revisão manual
    const paymentData = {
      customerData: {
        name: formState.fullName,
        email: formState.email,
        cpf: formState.cpf,
        phone: formState.phone,
        address: formState.street ? {
          street: formState.street,
          number: formState.number,
          complement: formState.complement,
          neighborhood: formState.neighborhood,
          city: formState.city,
          state: formState.state,
          postalCode: formState.cep.replace(/[^\d]/g, '')
        } : undefined
      },
      orderData: {
        productId: 'prod-001', // Substituir com ID do produto real do contexto ou props
        productName: 'Product Name', // Substituir com nome do produto real do contexto ou props
        productPrice: 120.00 // Substituir com preço do produto real do contexto ou props
      },
      cardData: {
        number: cardData.cardNumber.replace(/\s+/g, ''),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        cvv: cardData.cvv,
        brand: 'VISA' // Padrão ou detectar a partir dos primeiros dígitos
      }
    };
    
    // Redirecionar para a página de revisão manual com os dados do pagamento
    navigate('/payment-failed', { state: paymentData });
    
  } catch (error) {
    console.error('Erro ao processar pagamento manual com cartão:', error);
    setError('Erro ao processar pagamento. Por favor, tente novamente.');
    toast({
      title: "Erro no processamento",
      description: "Houve um problema ao processar o pagamento. Por favor, tente novamente.",
      variant: "destructive",
      duration: 5000,
    });
  } finally {
    setIsSubmitting(false);
  }
};

/**
 * Processa pagamento com cartão de forma automática
 */
const handleAutomaticCardProcessing = async (
  cardData: CardFormData,
  formState: any,
  settings: PaymentProcessorProps['settings'],
  isSandbox: boolean,
  setPaymentStatus: (status: string | null) => void,
  setIsSubmitting: (isSubmitting: boolean) => void,
  setError: (error: string) => void,
  toast: ReturnType<typeof useToast>['toast'],
  onSubmit: (data: PaymentResult) => void
) => {
  try {
    // Em uma implementação real, isso chamaria a API do Asaas
    // Preparar dados do cliente
    const customerData = {
      name: formState.fullName,
      email: formState.email,
      cpfCnpj: formState.cpf?.replace(/[^\d]/g, '') || '',
      phone: formState.phone?.replace(/[^\d]/g, '') || '',
      address: formState.street,
      addressNumber: formState.number,
      complement: formState.complement,
      province: formState.neighborhood,
      postalCode: formState.cep?.replace(/[^\d]/g, '') || '',
      city: formState.city,
      state: formState.state
    };

    // Simular a criação do cliente
    const customer = await simulateCustomerCreation();
    
    // Simular o processamento do pagamento
    const simulatedPayment = await simulateCardPayment();
    
    setPaymentStatus(simulatedPayment.status);
    
    // Preparar dados para registro do pedido
    onSubmit({
      method: 'card',
      paymentId: simulatedPayment.id,
      status: simulatedPayment.status,
      timestamp: new Date().toISOString(),
      cardNumber: formatCardNumber(cardData.cardNumber),
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cvv: '***',
      brand: simulatedPayment.creditCard.creditCardBrand
    });
    
    if (simulatedPayment.status === 'CONFIRMED') {
      toast({
        title: "Pagamento aprovado!",
        description: `Pagamento com ${simulatedPayment.creditCard.creditCardBrand} processado com sucesso.`,
        duration: 5000,
      });
    } else {
      setError('Pagamento recusado. Por favor, verifique os dados do cartão ou tente outro método de pagamento.');
      toast({
        title: "Pagamento recusado",
        description: "Não foi possível processar o pagamento com este cartão.",
        variant: "destructive",
        duration: 5000,
      });
    }
  } catch (error) {
    console.error('Erro ao processar pagamento com cartão de crédito:', error);
    setError('Erro ao processar pagamento. Por favor, tente novamente.');
    toast({
      title: "Erro no processamento",
      description: "Houve um problema ao processar o pagamento. Por favor, tente novamente.",
      variant: "destructive",
      duration: 5000,
    });
  } finally {
    setIsSubmitting(false);
  }
};
