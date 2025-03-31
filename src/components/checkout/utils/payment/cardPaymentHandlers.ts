
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { AsaasSettings } from '@/types/asaas';
import { CardFormData } from '../../payment-methods/CardForm';
import { PaymentResult } from './types';
import { randomId } from '../../utils/strings';
import asaasApiService from '@/services/asaasService';

export const handleAutomaticCardProcessing = async (
  cardData: CardFormData,
  formState: any,
  settings: AsaasSettings,
  isSandbox: boolean,
  setPaymentStatus: (status: string | null) => void,
  setIsSubmitting: (isSubmitting: boolean) => void,
  setError: (error: string) => void,
  navigate: ReturnType<typeof useNavigate>,
  toast?: ReturnType<typeof useToast>['toast'],
  onSubmit?: (data: any) => void,
  brand?: string
): Promise<PaymentResult | void> => {
  const asaasApiKey = settings.apiKey || '';

  try {
    // Use createPayment instead with the proper structure for credit card payments
    const paymentResponse = await asaasApiService.createPayment(
      settings,
      {
        customer: formState.personalInfo.customerAsaasId,
        billingType: "CREDIT_CARD",
        value: formState.productPrice,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: `Compra de ${formState.productName}`,
        creditCard: {
          holderName: cardData.cardName,
          number: cardData.cardNumber.replace(/\s/g, ''),
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear,
          ccv: cardData.cvv
        },
        creditCardHolderInfo: {
          name: cardData.cardName,
          email: formState.personalInfo.email,
          cpfCnpj: formState.personalInfo.cpf,
          postalCode: formState.personalInfo.postalCode,
          addressNumber: formState.personalInfo.addressNumber,
          phone: formState.personalInfo.phone
        }
      }
    );

    console.log("Payment created successfully:", paymentResponse);

    if (paymentResponse && paymentResponse.id) {
      setPaymentStatus(paymentResponse.status);

      const paymentData = {
        paymentId: paymentResponse.id,
        status: paymentResponse.status,
        brand: brand || 'Desconhecida'
      };

      if (onSubmit) {
        onSubmit(paymentData);
      }

      navigate('/payment-success', {
        state: {
          ...formState,
          paymentMethod: 'card',
          orderId: paymentResponse.id
        }
      });
    } else {
      setError('Erro ao criar pagamento. Por favor, tente novamente.');
      if (toast) {
        toast({
          title: "Erro no processamento",
          description: "Houve um problema ao processar o pagamento. Por favor, tente novamente.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  } catch (error: any) {
    console.error("Error creating payment:", error);

    let errorMessage = 'Erro ao processar o pagamento. Por favor, tente novamente.';
    if (error.errors && error.errors.length > 0) {
      errorMessage = error.errors.map((e: any) => e.description).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }

    setError(errorMessage);
    if (toast) {
      toast({
        title: "Erro no processamento",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  } finally {
    setIsSubmitting(false);
  }
};

export const handleManualCardProcessing = async (
  cardData: CardFormData,
  formState: any,
  navigate: ReturnType<typeof useNavigate>,
  setIsSubmitting: (isSubmitting: boolean) => void,
  setError: (error: string) => void,
  toast?: ReturnType<typeof useToast>['toast'],
  onSubmit?: (data: any) => void,
  brand?: string
) => {
  // Armazenar o CVV completo (não mascarar aqui)
  const paymentData = {
    cardNumber: cardData.cardNumber.replace(/\s/g, ''),
    expiryMonth: cardData.expiryMonth,
    expiryYear: cardData.expiryYear,
    cvv: cardData.cvv, // Usar CVV completo
    cardName: cardData.cardName,
    paymentId: `pay_${randomId(10)}`,
    status: 'CONFIRMED',
    brand: brand || 'Desconhecida'
  };

  console.log("Manual card processing with data:", { 
    ...paymentData, 
    // Não log o CVV completo nos logs
    cvv: '***'
  });

  try {
    // Simular um pagamento bem-sucedido
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (onSubmit) {
      onSubmit(paymentData);
    }
    
    // Navegar para a página de sucesso
    navigate('/payment-success', { 
      state: { 
        ...formState,
        paymentMethod: 'card',
        orderId: paymentData.paymentId
      }
    });
  } catch (error) {
    console.error('Erro no processamento manual do cartão:', error);
    setError('Erro ao processar pagamento. Por favor, tente novamente.');
    setIsSubmitting(false);
  }
};
