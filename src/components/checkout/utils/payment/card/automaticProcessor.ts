
import asaasApiService from '@/services/asaasService';

export const processAutomatic = async ({
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
}) => {
  // Check if API key is present
  const asaasApiKey = settings?.apiKey;
  
  if (!asaasApiKey) {
    console.error("Missing Asaas API key. Falling back to manual processing");
    return processManual({
      cardData,
      formState,
      navigate,
      setIsSubmitting,
      setError,
      toast,
      onSubmit,
      brand
    });
  }

  try {
    // Use mock data if customerAsaasId is undefined (when Asaas is disabled)
    const customerAsaasId = formState?.personalInfo?.customerAsaasId || `cus_${Math.random().toString(36).substring(2, 10)}`;
    
    console.log("Processing payment with customerAsaasId:", customerAsaasId);
    
    // Use createPayment instead with the proper structure for credit card payments
    const paymentResponse = await asaasApiService.createPayment(
      settings,
      {
        customer: customerAsaasId,
        billingType: "CREDIT_CARD",
        value: formState.productPrice,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: `Compra de ${formState.productName || 'produto'}`,
        creditCard: {
          holderName: cardData.cardName,
          number: cardData.cardNumber.replace(/\s/g, ''),
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear,
          ccv: cardData.cvv
        },
        creditCardHolderInfo: {
          name: cardData.cardName,
          email: formState.personalInfo?.email || 'customer@example.com',
          cpfCnpj: formState.personalInfo?.cpf || '00000000000',
          postalCode: formState.personalInfo?.postalCode || '00000000',
          addressNumber: formState.personalInfo?.addressNumber || '0',
          phone: formState.personalInfo?.phone || ''
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
  } catch (error) {
    console.error("Error creating payment:", error);

    let errorMessage = 'Erro ao processar o pagamento. Por favor, tente novamente.';
    if (error.errors && error.errors.length > 0) {
      errorMessage = error.errors.map((e) => e.description).join(', ');
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
    
    // If API error occurs, fall back to manual processing
    console.log("API error occurred. Falling back to manual processing");
    return processManual({
      cardData,
      formState,
      navigate,
      setIsSubmitting,
      setError,
      toast,
      onSubmit,
      brand
    });
  } finally {
    setIsSubmitting(false);
  }
};

// Import this at the end to avoid circular dependencies
import { processManual } from './manualProcessor';
