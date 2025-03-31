
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductCheckout } from '@/hooks/useProductCheckout';
import { Loader2, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';
import { Card, CardContent } from '@/components/ui/card';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';
import { usePixel } from '@/contexts/PixelContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import { PaymentMethod } from '@/types/order';

const Checkout = () => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const { product, loading, productNotFound } = useProductCheckout(productSlug);
  const { trackPageView } = usePixel();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);

  React.useEffect(() => {
    trackPageView();
    console.log('Checkout renderizado com slug:', productSlug);
  }, [trackPageView, productSlug]);
  
  if (loading) {
    return (
      <CheckoutContainer>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Carregando dados do produto, por favor aguarde...</p>
          </div>
        </div>
      </CheckoutContainer>
    );
  }
  
  if (productNotFound || !product) {
    return (
      <CheckoutContainer>
        <Card className="mb-6 shadow-sm">
          <CardContent className="py-6">
            <div className="text-center">
              <ShoppingBag className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-600 mb-2">Produto não encontrado</h2>
              <p className="text-gray-600 mb-4">
                O produto que você está procurando não existe ou foi removido.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Slug procurado: {productSlug || 'Não fornecido'}
              </p>
              
              <Button 
                onClick={() => navigate('/')}
                className="flex items-center"
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para a página inicial
              </Button>
            </div>
          </CardContent>
        </Card>
      </CheckoutContainer>
    );
  }
  
  const productDetails: ProductDetailsType = {
    id: product.id,
    name: product.name,
    price: product.price,
    description: product.description || '',
    image: product.imageUrl || '/placeholder.svg',
    isDigital: product.isDigital,
  };

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulação de processamento de pagamento
    setTimeout(() => {
      setIsProcessing(false);
      setIsOrderSubmitted(true);
      
      toast({
        title: "Pedido concluído!",
        description: "Seu pagamento foi processado com sucesso.",
        variant: "default",
      });
    }, 2000);
  };
  
  // Se o pedido foi concluído, mostrar mensagem de sucesso
  if (isOrderSubmitted) {
    return (
      <CheckoutContainer>
        <Card className="mb-6 shadow-sm">
          <CardContent className="py-6">
            <div className="text-center">
              <div className="bg-green-100 text-green-700 rounded-full p-3 inline-flex mb-4">
                <Check className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 mb-3">Pedido Concluído!</h2>
              <p className="text-gray-600 mb-4">
                Obrigado por sua compra. Você receberá um e-mail com os detalhes do pedido.
              </p>
              
              <Button 
                onClick={() => navigate('/')}
                className="mt-4"
                variant="outline"
              >
                Voltar para a página inicial
              </Button>
            </div>
          </CardContent>
        </Card>
      </CheckoutContainer>
    );
  }
  
  return (
    <CheckoutContainer>
      <CheckoutProgress
        productDetails={productDetails}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        handlePayment={handlePayment}
        isProcessing={isProcessing}
      />
    </CheckoutContainer>
  );
};

export default Checkout;
