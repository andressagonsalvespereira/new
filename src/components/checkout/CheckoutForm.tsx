
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
import { validateCardForm } from './utils/checkoutValidation';

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

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardFormSubmit = async (cardData: CardFormData) => {
    const validationErrors = validateCardForm(
      cardData.cardName,
      cardData.cardNumber,
      cardData.expiryMonth,
      cardData.expiryYear,
      cardData.cvv
    );
    
    if (validationErrors) {
      // Take the first error message to display
      const firstError = Object.values(validationErrors)[0];
      setError(firstError || 'Verifique os dados do cartão');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    // Check if manual card processing is enabled
    if (settings.manualCardProcessing) {
      try {
        // Prepare data for manual review page
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
            productId: 'prod-001', // Replace with actual product ID from context or props
            productName: 'Product Name', // Replace with actual product name from context or props
            productPrice: 120.00 // Replace with actual product price from context or props
          },
          cardData: {
            number: cardData.cardNumber.replace(/\s+/g, ''),
            expiryMonth: cardData.expiryMonth,
            expiryYear: cardData.expiryYear,
            cvv: cardData.cvv,
            brand: 'VISA' // Default or detect from first digits
          }
        };
        
        // Redirect to manual review page with payment data
        navigate('/payment-failed', { state: paymentData });
        
      } catch (error) {
        console.error('Error processing manual card payment:', error);
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
      // In a real implementation, this would call the API of Asaas
      // First create a customer
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

      // Simulate customer creation for demonstration
      // const customer = await asaasService.createCustomer(customerData, isSandbox);
      const customer = { id: 'cus_000005118652' }; // Simulated customer ID
      
      // Then create a payment with credit card
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

      // Simulate payment processing for demonstration
      // const payment = await asaasService.createPayment(paymentData, isSandbox);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate a successful or failed payment (70% success rate for demonstration)
      const isSuccessful = Math.random() > 0.3;
      const simulatedPayment = { 
        id: 'pay_000012345678',
        status: isSuccessful ? 'CONFIRMED' : 'DECLINED',
        creditCard: {
          creditCardBrand: 'VISA'
        }
      };
      
      setPaymentStatus(simulatedPayment.status);
      
      // Prepare data for order registration
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
      console.error('Error processing credit card payment:', error);
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

  // If payment has been confirmed, show success message
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
