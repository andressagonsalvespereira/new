
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard, Home } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/contexts/OrderContext';
import { CreateOrderInput } from '@/types/order';

interface PaymentFailedState {
  customerData: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    address?: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      postalCode: string;
    };
  };
  orderData: {
    productId: string;
    productName: string;
    productPrice: number;
  };
  cardData: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    brand?: string;
  };
}

const PaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addOrder } = useOrders();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentState, setPaymentState] = useState<PaymentFailedState | null>(null);

  useEffect(() => {
    // Get payment data from location state
    const state = location.state as PaymentFailedState | null;
    
    if (!state) {
      toast({
        title: "Erro",
        description: "Dados do pagamento não encontrados",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    setPaymentState(state);
    
    // Create order with manual processing status
    const createManualOrder = async () => {
      try {
        if (!state) return;
        
        const orderData: CreateOrderInput = {
          customer: state.customerData,
          productId: state.orderData.productId,
          productName: state.orderData.productName,
          productPrice: state.orderData.productPrice,
          paymentMethod: 'card',
          paymentStatus: 'manual_review',
          cardDetails: state.cardData,
        };

        await addOrder(orderData);
        
        setIsSuccess(true);
        toast({
          title: "Dados recebidos",
          description: "Seus dados foram enviados para análise manual com sucesso.",
        });
      } catch (error) {
        console.error('Error creating manual order:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao salvar os dados do pagamento.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    createManualOrder();
  }, [location.state, addOrder, navigate, toast]);

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!paymentState) {
    return null;
  }

  // Mask card number for display
  const maskCardNumber = (number: string) => {
    const lastFour = number.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4">
      <Card className="max-w-lg mx-auto shadow-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Pagamento Reprovado - Aguardando Análise Manual</CardTitle>
          <CardDescription>
            Seu pagamento foi enviado para análise manual. Entraremos em contato em breve.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seu pagamento está pendente de revisão manual. Você receberá uma confirmação por email quando for aprovado.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Dados do Cliente</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Nome:</p>
                <p className="font-medium">{paymentState.customerData.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Email:</p>
                <p className="font-medium">{paymentState.customerData.email}</p>
              </div>
              <div>
                <p className="text-gray-500">CPF:</p>
                <p className="font-medium">{paymentState.customerData.cpf}</p>
              </div>
              <div>
                <p className="text-gray-500">Telefone:</p>
                <p className="font-medium">{paymentState.customerData.phone}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Dados do Pedido</h3>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{paymentState.orderData.productName}</p>
                  <p className="text-gray-500 text-sm">Aguardando aprovação manual</p>
                </div>
                <p className="font-bold text-lg">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(paymentState.orderData.productPrice)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Dados do Cartão</h3>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                <div>
                  <p className="font-medium">{maskCardNumber(paymentState.cardData.number)}</p>
                  <p className="text-sm text-gray-500">
                    Validade: {paymentState.cardData.expiryMonth}/{paymentState.cardData.expiryYear}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pt-2">
          <Button 
            onClick={handleBackToHome}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Home className="mr-2 h-4 w-4" />
            Voltar para a Página Inicial
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentFailed;
