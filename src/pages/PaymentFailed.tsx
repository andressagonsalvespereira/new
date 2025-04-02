import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';
import { usePixel } from '@/contexts/PixelContext';
import { logger } from '@/utils/logger';

const PaymentFailed = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { trackPurchase } = usePixel();

  const order = state?.orderData || null;

  // 📦 Log + rastreio de tentativa de compra falha
  useEffect(() => {
    const transactionId = `failed-${Date.now()}`;

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

    logger.warn('❌ Pagamento falhou - evento de tentativa registrado:', purchase);
    trackPurchase(purchase);
  }, [order, trackPurchase]);

  if (!order) {
    logger.error('🚫 Nenhum dado de pedido encontrado no estado para página de falha.');
  } else {
    logger.info('📄 Renderizando página de falha com dados do pedido:', order);
  }

  return (
    <CheckoutContainer>
      <Card className="border-red-200 bg-red-50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>

            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Pagamento Não Aprovado
            </h2>

            <p className="text-red-600 mb-4">
              Infelizmente seu pagamento não foi aprovado pela operadora do cartão.
            </p>

            <div className="w-full max-w-md bg-white rounded-lg p-4 mb-4 shadow-sm">
              <h3 className="font-medium mb-2">Possíveis motivos:</h3>
              <ul className="text-sm text-gray-600 text-left list-disc pl-5 space-y-1">
                <li>Saldo ou limite insuficiente</li>
                <li>Cartão bloqueado ou com restrições</li>
                <li>Dados do cartão inseridos incorretamente</li>
                <li>Transação não autorizada pelo banco emissor</li>
              </ul>
            </div>

            <div className="space-y-3 w-full">
              <Button
                onClick={() => {
                  logger.log('🔁 Usuário clicou em "Tentar novamente"');
                  navigate(`/checkout/${order?.productSlug || 'test-product'}`);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Tentar novamente
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  logger.log('🏠 Usuário retornou à home pela página de falha');
                  navigate('/');
                }}
                className="w-full"
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

export default PaymentFailed;
