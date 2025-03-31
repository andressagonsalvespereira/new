
import React, { useState } from 'react';
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
  onSubmit: (data: any) => void;
  isSandbox: boolean;
  isDigitalProduct?: boolean;
}

const CheckoutForm = ({ onSubmit, isSandbox, isDigitalProduct = false }: CheckoutFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { formState } = useCheckoutForm();
  const { settings } = useAsaas();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

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
        manualCardStatus: settings?.manualCardStatus 
      });
    console.log("Is digital product:", isDigitalProduct);
    
    try {
      // Process payment with card using the utility with object parameter
      await processCardPayment({
        cardData,
        props: { 
          formState: { ...formState, isDigitalProduct }, 
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
    } catch (error) {
      console.error("Error in handleCardFormSubmit:", error);
      setError('Falha ao processar o pagamento. Por favor, tente novamente.');
      setIsSubmitting(false);
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
    
    switch (settings?.manualCardStatus) {
      case 'APPROVED':
        return 'Enviar para Aprovação Manual';
      case 'DENIED':
        return 'Enviar para Verificação';
      case 'ANALYSIS':
      default:
        return 'Enviar para Análise Manual';
    }
  };

  return (
    <div className="space-y-4">
      {settings?.manualCardProcessing && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {settings?.manualCardStatus === 'DENIED' 
              ? 'Este pagamento será processado manualmente e poderá ser recusado.'
              : settings?.manualCardStatus === 'APPROVED'
                ? 'Este pagamento será processado manualmente e aprovado temporariamente.'
                : 'Este pagamento passará por análise manual e não será processado automaticamente.'}
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
