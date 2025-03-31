
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
  
  try {
    // Verificar se o processamento manual de cartão está ativado
    if (settings.manualCardProcessing) {
      await handleManualCardProcessing(
        cardData,
        formState,
        navigate,
        setIsSubmitting,
        setError,
        toast,
        onSubmit
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
      onSubmit
    );
  } catch (error) {
    console.error('Erro geral ao processar pagamento:', error);
    setError('Erro ao processar pagamento. Por favor, tente novamente.');
    toast({
      title: "Erro no processamento",
      description: "Houve um problema ao processar o pagamento. Por favor, tente novamente.",
      variant: "destructive",
      duration: 5000,
    });
    setIsSubmitting(false);
  }
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
  toast: ReturnType<typeof useToast>['toast'],
  onSubmit: (data: PaymentResult) => void
) => {
  try {
    // Determine o brand do cartão com base no primeiro dígito
    let brand = detectCardBrand(cardData.cardNumber);
    
    // Preparar dados para a página de revisão manual
    const orderData = {
      productId: formState.productId || 'prod-001', 
      productName: formState.productName || 'Product Name',
      productPrice: formState.productPrice || 120.00,
      paymentMethod: 'CREDIT_CARD'
    };

    const customerData = {
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
    };

    // Preparar e enviar dados do pedido para registro
    const paymentResult: PaymentResult = {
      method: 'card',
      paymentId: `manual-${Date.now()}`,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      cardNumber: formatCardNumber(cardData.cardNumber),
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cvv: '***',
      brand: brand
    };

    // Registrar pedido antes de redirecionar
    try {
      await onSubmit(paymentResult);
      console.log("Pedido registrado com sucesso para pagamento manual");
      
      // Redirecionar para a página de pagamento manual com os dados
      setTimeout(() => {
        navigate('/payment-failed', { 
          state: { 
            customerData,
            orderData,
            paymentResult 
          } 
        });
      }, 1000);
    } catch (error) {
      console.error("Erro ao registrar pedido:", error);
      setError('Erro ao registrar o pedido. Por favor, tente novamente.');
      setIsSubmitting(false);
    }
    
  } catch (error) {
    console.error('Erro ao processar pagamento manual com cartão:', error);
    setError('Erro ao processar pagamento. Por favor, tente novamente.');
    toast({
      title: "Erro no processamento",
      description: "Houve um problema ao processar o pagamento. Por favor, tente novamente.",
      variant: "destructive",
      duration: 5000,
    });
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
  navigate: ReturnType<typeof useNavigate>,
  toast: ReturnType<typeof useToast>['toast'],
  onSubmit: (data: PaymentResult) => void
) => {
  try {
    console.log("Iniciando processamento de cartão automático", formState);
    
    // Determine o brand do cartão com base no primeiro dígito
    let brand = detectCardBrand(cardData.cardNumber);
    
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
    const paymentResult: PaymentResult = {
      method: 'card',
      paymentId: simulatedPayment.id,
      status: simulatedPayment.status,
      timestamp: new Date().toISOString(),
      cardNumber: formatCardNumber(cardData.cardNumber),
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cvv: '***',
      brand: brand
    };

    const orderData = {
      productId: formState.productId,
      productName: formState.productName,
      productPrice: formState.productPrice,
      paymentMethod: 'CREDIT_CARD'
    };

    console.log("Dados do produto para registro:", orderData);
    console.log("Dados do cliente para registro:", customerData);
    
    // Registrar o pedido antes de redirecionar
    try {
      await onSubmit(paymentResult);
      console.log("Pedido registrado com sucesso para pagamento automático");
      
      if (simulatedPayment.status === 'CONFIRMED') {
        toast({
          title: "Pagamento aprovado!",
          description: `Pagamento com ${brand} processado com sucesso.`,
          duration: 5000,
        });
        
        // Direcionar para a página de sucesso
        setTimeout(() => {
          navigate('/payment-success', { 
            state: { 
              customerData,
              orderData,
              paymentResult
            } 
          });
        }, 1000);
      } else {
        setError('Pagamento recusado. Por favor, verifique os dados do cartão ou tente outro método de pagamento.');
        toast({
          title: "Pagamento recusado",
          description: "Não foi possível processar o pagamento com este cartão.",
          variant: "destructive",
          duration: 5000,
        });
        
        // Direcionar para a página de erro de pagamento
        setTimeout(() => {
          navigate('/payment-failed', { 
            state: { 
              customerData,
              orderData,
              paymentResult
            } 
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Erro ao registrar pedido:", error);
      setError('Erro ao registrar o pedido. Por favor, tente novamente.');
      setIsSubmitting(false);
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
    setIsSubmitting(false);
  }
};

/**
 * Detecta a bandeira do cartão com base no primeiro dígito
 */
const detectCardBrand = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  const firstDigit = cleanNumber.charAt(0);
  
  // Simplificado para o propósito do exemplo
  switch (firstDigit) {
    case '4':
      return 'VISA';
    case '5':
      return 'MASTERCARD';
    case '3':
      return 'AMEX';
    case '6':
      return 'DISCOVER';
    default:
      return 'Desconhecida';
  }
};
