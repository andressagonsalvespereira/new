
import React, { useState, useEffect } from 'react';
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
import { AsaasSettings } from '@/types/asaas';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  
  // Log component mount and props for debugging
  useEffect(() => {
    console.log("CheckoutForm mounted with props:", {
      isSandbox,
      isDigitalProduct,
      useCustomProcessing,
      manualCardStatus
    });
    console.log("Asaas settings:", settings);
  }, [isSandbox, isDigitalProduct, useCustomProcessing, manualCardStatus, settings]);

  // Default settings if none are provided
  const defaultSettings: AsaasSettings = {
    isEnabled: false,
    manualCardProcessing: true,
    manualCreditCard: false,
    apiKey: '',
    allowPix: true,
    allowCreditCard: true,
    sandboxMode: true,
    sandboxApiKey: '',
    productionApiKey: '',
    manualPixPage: false,
    manualPaymentConfig: true,
    manualCardStatus: 'ANALYSIS'
  };

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
      // Explicitly set isSubmitting to true
      setIsSubmitting(true);
      
      // Process payment with card using the utility with object parameter
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
      
      // Show error toast
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar seu pagamento. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Se o pagamento foi confirmado ou está em análise, mostrar mensagem apropriada
  if (paymentStatus) {
    return <PaymentStatusMessage status={paymentStatus} />;
  }

  // Determinar o texto do botão com base nas configurações
  const getButtonText = () => {
    if (!settings?.manualCardProcessing) {
      return 'Finalizar Pagamento';
    }
    
    // Verificar se deve usar configurações específicas do produto
    const cardStatus = useCustomProcessing && manualCardStatus
      ? manualCardStatus
      : settings?.manualCardStatus;
    
    switch (cardStatus) {
      case 'APPROVED':
        return 'Enviar para Aprovação Manual';
      case 'DENIED':
        return 'Enviar para Verificação (será recusado)';
      case 'ANALYSIS':
      default:
        return 'Enviar para Análise Manual';
    }
  };

  // Mensagem de alerta baseada na configuração de processamento
  const getAlertMessage = () => {
    // Verificar se deve usar configurações específicas do produto
    const cardStatus = useCustomProcessing && manualCardStatus
      ? manualCardStatus
      : settings?.manualCardStatus;
    
    switch (cardStatus) {
      case 'DENIED':
        return 'Este pagamento será processado manualmente e será RECUSADO automáticamente.';
      case 'APPROVED':
        return 'Este pagamento será processado manualmente e aprovado temporariamente.';
      case 'ANALYSIS':
      default:
        return 'Este pagamento passará por análise manual e não será processado automaticamente.';
    }
  };

  // Estilo do alerta baseado na configuração de processamento
  const getAlertStyles = () => {
    // Verificar se deve usar configurações específicas do produto
    const cardStatus = useCustomProcessing && manualCardStatus
      ? manualCardStatus
      : settings?.manualCardStatus;
    
    return {
      alertClass: cardStatus === 'DENIED' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200',
      iconClass: cardStatus === 'DENIED' ? 'text-red-600' : 'text-amber-600',
      textClass: cardStatus === 'DENIED' ? 'text-red-800' : 'text-amber-800'
    };
  };

  const alertStyles = getAlertStyles();

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
        buttonText={getButtonText()}
        loading={isSubmitting}
      />
    </div>
  );
};

export default CheckoutForm;
