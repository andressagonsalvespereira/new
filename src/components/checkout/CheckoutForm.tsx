
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CreditCard, AlertCircle, Loader2, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import asaasService from '@/services/asaasService';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';

interface CheckoutFormProps {
  onSubmit: (data: any) => void;
  isSandbox: boolean;
}

const CheckoutForm = ({ onSubmit, isSandbox }: CheckoutFormProps) => {
  const { toast } = useToast();
  const { formState } = useCheckoutForm();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
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

  const validateForm = () => {
    if (!cardName.trim()) {
      setError('Nome no cartão é obrigatório');
      return false;
    }
    
    if (cardNumber.replace(/\s+/g, '').length < 16) {
      setError('Número do cartão inválido');
      return false;
    }
    
    if (!expiryMonth) {
      setError('Mês de validade é obrigatório');
      return false;
    }
    
    if (!expiryYear) {
      setError('Ano de validade é obrigatório');
      return false;
    }
    
    if (cvv.length < 3) {
      setError('CVV inválido');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call the Asaas API
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

      // Simulate customer creation for demo
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
          holderName: cardName,
          number: cardNumber.replace(/\s+/g, ''),
          expiryMonth,
          expiryYear,
          ccv: cvv
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

      // Simulate payment processing for demo
      // const payment = await asaasService.createPayment(paymentData, isSandbox);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate a successful or failed payment (70% success rate for demo)
      const isSuccessful = Math.random() > 0.3;
      const simulatedPayment = { 
        id: 'pay_000012345678',
        status: isSuccessful ? 'CONFIRMED' : 'DECLINED',
        creditCard: {
          creditCardBrand: 'VISA'
        }
      };
      
      setPaymentStatus(simulatedPayment.status);
      
      if (simulatedPayment.status === 'CONFIRMED') {
        toast({
          title: "Pagamento aprovado!",
          description: `Pagamento com ${simulatedPayment.creditCard.creditCardBrand} processado com sucesso.`,
          duration: 5000,
        });
        
        onSubmit({
          method: 'card',
          paymentId: simulatedPayment.id,
          status: simulatedPayment.status,
          timestamp: new Date().toISOString()
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

  if (paymentStatus === 'CONFIRMED') {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Pagamento Aprovado</h3>
        <p className="text-gray-600 mb-4">
          Seu pagamento foi processado com sucesso. Obrigado pela sua compra!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="cardName" className="text-sm">Nome no Cartão</Label>
          <Input
            id="cardName"
            placeholder="Nome impresso no cartão"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="h-9 mt-1 border-gray-300"
            disabled={isSubmitting}
          />
        </div>

        <div className="mt-3">
          <Label htmlFor="cardNumber" className="text-sm">Número do Cartão</Label>
          <div className="relative mt-1">
            <Input
              id="cardNumber"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              className="h-9 border-gray-300 pl-10"
              disabled={isSubmitting}
            />
            <CreditCard className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="col-span-2">
            <Label className="text-sm">Validade</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Select value={expiryMonth} onValueChange={setExpiryMonth} disabled={isSubmitting}>
                <SelectTrigger className="h-9 border-gray-300">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    return (
                      <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              <Select value={expiryYear} onValueChange={setExpiryYear} disabled={isSubmitting}>
                <SelectTrigger className="h-9 border-gray-300">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="cvv" className="text-sm">CVV</Label>
            <Input
              id="cvv"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={4}
              className="h-9 mt-1 border-gray-300"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="mt-4">
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Finalizar Pagamento'
            )}
          </Button>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Seu pagamento está seguro e criptografado
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
