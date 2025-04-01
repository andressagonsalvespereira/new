import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import { useAsaas } from '@/contexts/AsaasContext';
import CardForm, { CardFormData } from './payment-methods/CardForm';
import PaymentError from './payment-methods/PaymentError';
import PaymentStatusMessage from './payment-methods/PaymentStatusMessage';
import { processCardPayment } from './utils/payment/card/cardProcessor';
import { useCardPaymentStatus } from '@/hooks/checkout/useCardPaymentStatus';

interface CheckoutFormProps {
  onSubmit: (data: any) => Promise<any>;
  isSandbox: boolean;
  isDigitalProduct?: boolean;
  useCustomProcessing?: boolean;
  manualCardStatus?: string;
}

const CheckoutForm = ({ 
  onSubmit, 
  isSandbox, 
  isDigitalProduct = false,
  useCustomProcessing = false,
  manualCardStatus = undefined
}: CheckoutFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { formState } = useCheckoutForm();
  const { settings } = useAsaas();
  
  const {
    isSubmitting,
    setIsSubmitting,
    error,
    setError,
    paymentStatus,
    setPaymentStatus,
    getButtonText,
    getAlertMessage,
    getAlertStyles,
    settings: defaultSettings
  } = useCardPaymentStatus({
    settings,
    useCustomProcessing,
    manualCardStatus
  });
  
  useEffect(() => {
    console.log("CheckoutForm mounted with props:", {
      isSandbox,
      isDigitalProduct,
      useCustomProcessing,
      manualCardStatus
    });
    console.log("Asaas settings:", settings);
  }, [isSandbox, isDigitalProduct, useCustomProcessing, manualCardStatus, settings]);

  useEffect(() => {
    console.log("IsSubmitting state changed:", isSubmitting);
  }, [isSubmitting]);

  const handleCardFormSubmit = async (cardData: CardFormData) => {
    console.log("Card form submitted, processing payment with settings:", 
      { 
        isEnabled: settings?.isEnabled, 
        manualCardProcessing: settings?.manualCardProcessing,
        manualCardStatus: settings?.manualCardStatus,
        useCustomProcessing: useCustomProcessing,
        productManualCardStatus: manualCardStatus
      });
    console.log("Is digital product:", isDigitalProduct);
    console.log("Card data received:", {
      cardName: cardData.cardName,
      cardNumber: cardData.cardNumber ? `****${cardData.cardNumber.slice(-4)}` : '',
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cvv: '***'
    });
    
    try {
      setIsSubmitting(true);
      console.log("Setting isSubmitting to true");
      
      await processCardPayment({
        cardData,
        props: { 
          formState: { 
            ...formState, 
            isDigitalProduct,
            useCustomProcessing,
            manualCardStatus 
          }, 
          settings: settings || defaultSettings, 
          isSandbox, 
          onSubmit 
        },
        setError,
        setPaymentStatus,
        setIsSubmitting,
        navigate,
        toast,
        isDigitalProduct
      });
      
      console.log("Payment processing completed");
    } catch (error) {
      console.error("Error in handleCardFormSubmit:", error);
      setError('Falha ao processar o pagamento. Por favor, tente novamente.');
      setIsSubmitting(false);
      
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar seu pagamento. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  if (paymentStatus) {
    return <PaymentStatusMessage status={paymentStatus} />;
  }

  const alertStyles = getAlertStyles();
  const buttonText = getButtonText();

  return (
    <div className="space-y-4">
      {settings?.manualCardProcessing && (
        <Alert className={alertStyles.alertClass}>
          <AlertCircle className={`h-4 w-4 ${alertStyles.iconClass}`} />
          <AlertDescription className={alertStyles.textClass}>
            {getAlertMessage()}
          </AlertDescription>
        </Alert>
      )}
      
      <PaymentError error={error} />
      
      <CardForm 
        onSubmit={handleCardFormSubmit}
        isSubmitting={isSubmitting}
        buttonText={buttonText}
        loading={isSubmitting}
      />
    </div>
  );
};

export default CheckoutForm;
