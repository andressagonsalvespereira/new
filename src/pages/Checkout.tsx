
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProductCheckout } from '@/hooks/useProductCheckout';
import { Loader2 } from 'lucide-react';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';
import { Card, CardContent } from '@/components/ui/card';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';
import { usePixel } from '@/contexts/PixelContext';

const Checkout = () => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const { product, loading } = useProductCheckout(productSlug);
  const { trackPageView } = usePixel();
  
  useEffect(() => {
    // Rastreamento de visualização de página
    trackPageView();
    
    // Depuração para verificar se o slug está sendo passado corretamente
    console.log('Checkout renderizado com slug:', productSlug);
  }, [trackPageView, productSlug]);
  
  // Mostrar loading enquanto o produto está sendo carregado
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
  
  // Mostrar mensagem se o produto não for encontrado
  if (!product) {
    return (
      <CheckoutContainer>
        <Card className="mb-6 shadow-sm">
          <CardContent className="py-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Produto não encontrado</h2>
              <p className="text-gray-600 mb-4">
                O produto que você está procurando não existe ou foi removido.
              </p>
              <p className="text-sm text-gray-500">
                Slug procurado: {productSlug || 'Não fornecido'}
              </p>
            </div>
          </CardContent>
        </Card>
      </CheckoutContainer>
    );
  }
  
  // Converter o produto para o formato esperado pelo componente de checkout
  const productDetails: ProductDetailsType = {
    id: product.id,
    name: product.name,
    price: product.price,
    description: product.description || '',
    image: product.imageUrl || '/placeholder.svg',
    isDigital: product.isDigital,
  };
  
  // Aqui renderiza o conteúdo do checkout com o produto carregado
  return (
    <CheckoutContainer>
      <Card className="mb-6 shadow-sm">
        <CardContent className="py-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2">{productDetails.name}</h1>
            <p className="text-gray-600">{productDetails.description}</p>
            <p className="text-xl font-semibold mt-2">R$ {productDetails.price.toFixed(2)}</p>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500 mb-2">
                Formulário de checkout em desenvolvimento.
              </p>
              <p className="text-sm text-gray-500">
                Em breve você poderá comprar este produto diretamente por esta página.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </CheckoutContainer>
  );
};

export default Checkout;
