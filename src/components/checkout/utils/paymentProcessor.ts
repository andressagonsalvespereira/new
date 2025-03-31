
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CardFormData } from '../payment-methods/CardForm';
import { formatCardNumber, validateCardForm } from './cardValidation';
import { AsaasSettings } from '@/types/asaas';

export interface PaymentProcessorProps {
  formState: any;
  settings: AsaasSettings;
  isSandbox: boolean;
  onSubmit: (data: any) => void;
}

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
    
    return;
  }
  
  try {
    // Em uma implementação real, isso chamaria a API do Asaas
    // Primeiro criar um cliente
    const customerData = {
      name: formState.fullName,
      email: formState.email,
      cpfCnpj: formState.cpf.replace(/[^\d]/g, ''),
      phone: formState.phone.replace(/[^\d]/g, ''),
      address: formState.street,
      addressNumber: formState.number,
      complement: formState.complement,
      province: formState.neighborhood,
      postalCode: formState.cep.replace(/[^\d]/g, ''),
      city: formState.city,
      state: formState.state
    };

    // Simular a criação do cliente para demonstração
    // const customer = await asaasService.createCustomer(customerData, isSandbox);
    const customer = { id: 'cus_000005118652' }; // ID de cliente simulado
    
    // Em seguida, criar um pagamento com cartão de crédito
    const today = new Date();
    
    const paymentData = {
      customer: customer.id,
      billingType: 'CREDIT_CARD' as const,
      value: 120.00,
      dueDate: today.toISOString().split('T')[0],
      description: 'Sua compra na loja',
      creditCard: {
        holderName: cardData.cardName,
        number: cardData.cardNumber.replace(/\s+/g, ''),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        ccv: cardData.cvv
      },
      creditCardHolderInfo: {
        name: formState.fullName,
        email: formState.email,
        cpfCnpj: formState.cpf.replace(/[^\d]/g, ''),
        postalCode: formState.cep.replace(/[^\d]/g, ''),
        addressNumber: formState.number,
        addressComplement: formState.complement,
        phone: formState.phone.replace(/[^\d]/g, '')
      }
    };

    // Simular o processamento do pagamento para demonstração
    // const payment = await asaasService.createPayment(paymentData, isSandbox);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular um pagamento bem-sucedido ou falho (70% de taxa de sucesso para demonstração)
    const isSuccessful = Math.random() > 0.3;
    const simulatedPayment = { 
      id: 'pay_000012345678',
      status: isSuccessful ? 'CONFIRMED' : 'DECLINED',
      creditCard: {
        creditCardBrand: 'VISA'
      }
    };
    
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
