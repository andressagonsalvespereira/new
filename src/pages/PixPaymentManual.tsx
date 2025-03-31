
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/contexts/OrderContext';
import { usePixel } from '@/contexts/PixelContext';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import CheckoutFooter from '@/components/checkout/CheckoutFooter';
import { CustomerInfo, PaymentStatus } from '@/types/order';

interface CheckoutHeaderProps {
  title: string;
}

const PixPaymentManual = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addOrder } = useOrders();
  const { trackPurchase } = usePixel();
  
  const { customer, product } = location.state || {};
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Verificar se há dados necessários
  if (!customer || !product) {
    return (
      <CheckoutContainer>
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Dados insuficientes</h2>
            <p className="text-gray-600 mb-4">
              Não foi possível processar o pagamento PIX. Informações de cliente ou produto ausentes.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Voltar para a página inicial
            </Button>
          </CardContent>
        </Card>
      </CheckoutContainer>
    );
  }

  const handleConfirmPayment = async () => {
    try {
      // Criar um pedido manual com status "Aguardando Confirmação Manual"
      const customerInfo: CustomerInfo = {
        name: customer.name,
        email: customer.email,
        cpf: customer.cpf,
        phone: customer.phone || '',
        ...(customer.address ? { address: customer.address } : {})
      };

      const paymentStatus: PaymentStatus = 'Pago';
      
      const order = await addOrder({
        customer: customerInfo,
        productId: product.id || '1',
        productName: product.name,
        productPrice: product.price,
        paymentMethod: 'PIX',
        paymentStatus,
        pixDetails: {
          qrCode: 'manual-pix-payment',
        }
      });

      // Registrar evento de compra
      trackPurchase({
        value: product.price,
        transactionId: `order-${order.id}`,
        products: [{
          id: product.id || '1',
          name: product.name,
          price: product.price,
          quantity: 1
        }]
      });

      setPaymentConfirmed(true);
      
      toast({
        title: "Confirmação de pagamento",
        description: "Seu pagamento foi confirmado! O pedido será processado em breve.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o pagamento. Tente novamente mais tarde.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <>
      <CheckoutHeader title={product.name} />
      
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-3">
            <CardTitle>Pagamento via PIX</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!paymentConfirmed ? (
              <div className="flex flex-col items-center justify-center py-8">
                <QrCode className="w-16 h-16 text-green-600 mb-4" />
                <h2 className="text-xl font-semibold text-center mb-2">
                  Faça o pagamento via PIX
                </h2>
                <p className="text-gray-600 text-center mb-6 max-w-md">
                  Para simular um pagamento PIX manual, clique no botão abaixo para confirmar que o pagamento foi realizado.
                </p>
                
                <div className="bg-gray-100 p-4 rounded-lg w-full max-w-md mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Produto:</span>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-medium">{customer.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(product.price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{customer.email}</span>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <Button
                    onClick={handleConfirmPayment}
                    className="bg-green-600 hover:bg-green-700 flex items-center"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Confirmar Pagamento
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-center mb-2 text-green-600">
                  Pagamento confirmado com sucesso!
                </h2>
                <p className="text-gray-600 text-center mb-6 max-w-md">
                  Seu pedido foi registrado e será processado em breve. Você receberá um e-mail com os detalhes da sua compra.
                </p>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Voltar para a página inicial
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <CheckoutFooter />
    </>
  );
};

export default PixPaymentManual;
