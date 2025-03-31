
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductCheckout } from '@/hooks/useProductCheckout';
import { Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';
import { Card, CardContent } from '@/components/ui/card';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';
import { usePixel } from '@/contexts/PixelContext';
import { Button } from '@/components/ui/button';
import CustomerInfoForm from '@/components/checkout/CustomerInfoForm';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { CustomerData } from '@/components/checkout/CustomerInfoForm';

const Checkout = () => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const { product, loading, productNotFound } = useProductCheckout(productSlug);
  const { trackPageView } = usePixel();
  const navigate = useNavigate();
  
  const [customerDetails, setCustomerDetails] = useState<CustomerData | null>(null);
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

  const handleCustomerSubmit = (data: CustomerData) => {
    setCustomerDetails(data);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    // Lógica de processamento de pagamento será implementada
    console.log('Pagamento processado', paymentData);
    setIsOrderSubmitted(true);
  };
  
  return (
    <CheckoutContainer>
      <Card className="mb-6 shadow-sm">
        <CardContent className="py-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2">{productDetails.name}</h1>
            <p className="text-gray-600">{productDetails.description}</p>
            <p className="text-xl font-semibold mt-2">R$ {productDetails.price.toFixed(2)}</p>
          </div>

          {!customerDetails ? (
            <CustomerInfoForm 
              onSubmit={handleCustomerSubmit} 
              isCompleted={false} 
            />
          ) : !isOrderSubmitted ? (
            <CheckoutForm 
              onSubmit={handlePaymentSubmit} 
              isSandbox={false} 
            />
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600">Pedido Concluído!</h2>
              <p>Obrigado por sua compra, {customerDetails.fullName}.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </CheckoutContainer>
  );
};

export default Checkout;

