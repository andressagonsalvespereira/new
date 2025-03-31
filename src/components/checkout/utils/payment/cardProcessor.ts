
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
  onSubmit: (data: PaymentResult) => void,
  brand: string = 'Desconhecida'
) => {
  try {
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

    console.log("Registering manual card payment with brand:", brand);

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
  onSubmit: (data: PaymentResult) => void,
  brand: string = 'Desconhecida'
) => {
  try {
    console.log("Iniciando processamento de cartão automático", formState);
    
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
    console.log("Dados de pagamento para registro com brand:", paymentResult);
    
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
 * Detecta a bandeira do cartão com base nos primeiros dígitos
 */
const detectCardBrand = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  // More detailed card brand detection
  if (cleanNumber.startsWith('4')) {
    return 'VISA';
  } else if (/^5[1-5]/.test(cleanNumber)) {
    return 'MASTERCARD';
  } else if (/^3[47]/.test(cleanNumber)) {
    return 'AMEX';
  } else if (/^6(?:011|5)/.test(cleanNumber)) {
    return 'DISCOVER';
  } else if (/^(36|38|30[0-5])/.test(cleanNumber)) {
    return 'DINERS';
  } else if (/^(606282|3841)/.test(cleanNumber)) {
    return 'HIPERCARD';
  } else if (/^50[0-9]/.test(cleanNumber)) {
    return 'AURA';
  } else if (/^(4011|431274|438935|451416|457393|4576|457631|457632|504175|627780|636297|636368|636369|(6503[1-3])|(6500(3[5-9]|4[0-9]|5[0-1]))|(6504(0[5-9]|1[0-9]|2[0-9]|3[0-9]))|(650(48[5-9]|49[0-9]|50[0-9]|51[1-9]|52[0-9]|53[0-7]))|(6505(4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-8]))|(6507(0[0-9]|1[0-8]))|(6507(2[0-7]))|(650(90[1-9]|91[0-9]|920))|(6516(5[2-9]|6[0-9]|7[0-9]))|(6550(0[0-9]|1[1-9]))|(6550(2[1-9]|3[0-9]|4[0-9]|5[0-8])))/.test(cleanNumber)) {
    return 'ELO';
  } else if (/^(606282|3841)/.test(cleanNumber)) {
    return 'HIPERCARD';
  } else {
    return 'DESCONHECIDA';
  }
};
