import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Clock } from 'lucide-react';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';
import { usePixel } from '@/contexts/PixelContext';
import { logger } from '@/utils/logger';

const PaymentSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { trackPurchase } = usePixel();

  const order = state?.orderData || null;

  const paymentStatus: string = order?.paymentStatus?.toUpperCase?.() || 'CONFIRMED';
  const isStatusUnderReview = ['PENDING', 'ANALYSIS', 'AGUARDANDO'].includes(paymentStatus);
  const isDenied = paymentStatus === 'DENIED';

  useEffect(() => {
    logger.info('📦 Pedido recebido na tela de sucesso:', order);
    logger.info('🔎 Status de pagamento:', paymentStatus);

    if (isDenied) {
      logger.warn('❌ Pagamento negado - redirecionando para /payment-failed');
      navigate('/payment-failed', { state: { orderData: order } });
    }
  }, [isDenied, navigate, order, paymentStatus]);

  useEffect(() => {
    const transactionId = `success-${Date.now()}`;
    const purchase = {
      value: order?.productPrice || 0,
      transactionId,
      products: [
        {
          id: order?.productId || 'unknown',
          name: order?.productName || 'Unknown product',
          price: order?.productPrice || 0,
          quantity: 1,
        },
      ],
    };

    logger.info('🧠 Enviando evento para pixel (trackPurchase):', purchase);
    trackPurchase(purchase);
  }, [order, trackPurchase]);

  if (!order) {
    logger.error('🚫 Nenhum dado de pedido disponível no estado.');
    return (
      <CheckoutContainer>
        <div className="text-center text-red-500 font-semibold py-10">
          Dados do pedido não encontrados.
        </div>
      </CheckoutContainer>
    );
  }

  if (isStatusUnderReview) {
    logger.info('⏳ Pagamento está em análise - exibindo mensagem de análise.');
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
              <OrderDetails order={order} statusLabel="Em análise" />
              <div className="space-y-3 w-full">
                <Button onClick={() => navigate('/')} className="w-full bg-amber-600 hover:bg-amber-700">
                  Voltar para a página inicial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </CheckoutContainer>
    );
  }

  logger.info('✅ Pagamento aprovado - exibindo mensagem de sucesso.');

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
            <OrderDetails order={order} />
            <div className="space-y-3 w-full">
              <Button onClick={() => navigate('/')} className="w-full bg-green-600 hover:bg-green-700">
                Voltar para a página inicial
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </CheckoutContainer>
  );
};

const OrderDetails = ({ order, statusLabel = 'Aprovado' }: { order: any; statusLabel?: string }) => {
  return (
    <div className="w-full max-w-md bg-white rounded-lg p-4 mb-4 shadow-sm">
      <h3 className="font-medium mb-2">Detalhes do pedido:</h3>
      <div className="text-sm text-gray-600 text-left space-y-1">
        <p><strong>Produto:</strong> {order.productName || 'Produto'}</p>
        <p><strong>Valor:</strong> R$ {(order.productPrice || 0).toFixed(2)}</p>
        <p><strong>Forma de pagamento:</strong> {order.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'PIX'}</p>
        <p><strong>Status:</strong> {statusLabel}</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
