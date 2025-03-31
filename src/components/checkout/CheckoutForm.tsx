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
import { processCardPayment } from './utils/payment/cardProcessor';

interface CheckoutFormProps {
  onSubmit: (data: any) => void;
  isSandbox: boolean;
}

const CheckoutForm = ({ onSubmit, isSandbox }: CheckoutFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { formState } = useCheckoutForm();
  const { settings } = useAsaas();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const handleCardFormSubmit = async (cardData: CardFormData) => {
    // Processar pagamento com cartão usando o utilitário
    await processCardPayment(
      cardData,
      { formState, settings, isSandbox, onSubmit },
      setError,
      setPaymentStatus,
      setIsSubmitting,
      navigate,
      toast
    );
  };

  // Se o pagamento foi confirmado, mostrar mensagem de sucesso
  if (paymentStatus === 'CONFIRMED') {
    return <PaymentStatusMessage status={paymentStatus} />;
  }

  return (
    <div className="space-y-4">
      {settings.manualCardProcessing && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Este pagamento passará por análise manual e não será processado automaticamente.
          </AlertDescription>
        </Alert>
      )}
      
      <PaymentError error={error} />
      
      <CardForm 
        onSubmit={handleCardFormSubmit}
        isSubmitting={isSubmitting}
        buttonText={settings.manualCardProcessing ? 'Enviar para Análise Manual' : 'Finalizar Pagamento'}
      />
    </div>
  );
};

export default CheckoutForm;
