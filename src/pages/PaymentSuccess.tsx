
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Clock } from 'lucide-react';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';
import { usePixel } from '@/contexts/PixelContext';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { trackPurchase } = usePixel();

  console.log("PaymentSuccess - Estado recebido:", state);

  // Added dummy purchase event data for when state is missing
  const defaultPurchaseData = {
    value: 0,
    transactionId: `success-${Date.now()}`,
    products: [{
      id: "unknown",
      name: "Unknown product",
      price: 0,
      quantity: 1
    }]
  };

  // Track successful purchase
  React.useEffect(() => {
    if (state?.orderData?.productPrice) {
      trackPurchase({
        value: state.orderData.productPrice,
        transactionId: `success-${Date.now()}`,
        products: [{
          id: state.orderData.productId || "unknown",
          name: state.orderData.productName || "Unknown product",
          price: state.orderData.productPrice,
          quantity: 1
        }]
      });
    } else {
      trackPurchase(defaultPurchaseData);
    }
  }, [state, trackPurchase]);
  
  // Determinar o status de pagamento
  const paymentStatus = state?.orderData?.paymentStatus || 'CONFIRMED';
  const isAnalysis = paymentStatus === 'PENDING' || paymentStatus === 'ANALYSIS';
  
  console.log("Estado do pagamento:", paymentStatus, "isAnalysis:", isAnalysis);
  
  // Se estiver no PaymentSuccess com status "em análise", mostrar informações específicas
  if (isAnalysis) {
    return (
      <CheckoutContainer>
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              
              <h2 className="text-xl font-semibold text-amber-700 mb-2">
                Pagamento em Análise
              </h2>
              
              <p className="text-amber-600 mb-4">
                Seu pagamento foi recebido e está em análise. Você receberá uma confirmação assim que for processado.
              </p>
              
              <div className="w-full max-w-md bg-white rounded-lg p-4 mb-4 shadow-sm">
                <h3 className="font-medium mb-2">Detalhes do pedido:</h3>
                {state?.orderData ? (
                  <div className="text-sm text-gray-600 text-left space-y-1">
                    <p><strong>Produto:</strong> {state.orderData.productName || 'Produto'}</p>
                    <p><strong>Valor:</strong> R$ {(state.orderData.productPrice || 0).toFixed(2)}</p>
                    <p><strong>Forma de pagamento:</strong> {state.orderData.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'PIX'}</p>
                    <p><strong>Status:</strong> Em análise</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Detalhes do pedido não disponíveis</p>
                )}
              </div>
              
              <div className="space-y-3 w-full">
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  Voltar para a página inicial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </CheckoutContainer>
    );
  }

  // Exibir página de sucesso normal (pagamento aprovado)
  return (
    <CheckoutContainer>
      <Card className="border-green-200 bg-green-50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-green-700 mb-2">
              Pagamento Aprovado
            </h2>
            
            <p className="text-green-600 mb-4">
              Seu pagamento foi processado com sucesso! Obrigado pela sua compra.
            </p>
            
            <div className="w-full max-w-md bg-white rounded-lg p-4 mb-4 shadow-sm">
              <h3 className="font-medium mb-2">Detalhes do pedido:</h3>
              {state?.orderData ? (
                <div className="text-sm text-gray-600 text-left space-y-1">
                  <p><strong>Produto:</strong> {state.orderData.productName || 'Produto'}</p>
                  <p><strong>Valor:</strong> R$ {(state.orderData.productPrice || 0).toFixed(2)}</p>
                  <p><strong>Forma de pagamento:</strong> {state.orderData.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'PIX'}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Detalhes do pedido não disponíveis</p>
              )}
            </div>
            
            <div className="space-y-3 w-full">
              <Button 
                onClick={() => navigate('/')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Voltar para a página inicial
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </CheckoutContainer>
  );
};

export default PaymentSuccess;
