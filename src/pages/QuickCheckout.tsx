
import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAsaas } from '@/contexts/AsaasContext';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import PixPayment from '@/components/checkout/PixPayment';
import { useQuickCheckout } from '@/hooks/useQuickCheckout';
import CustomerForm from '@/components/checkout/quick-checkout/CustomerForm';
import PaymentMethodSelector from '@/components/checkout/quick-checkout/PaymentMethodSelector';
import OrderSuccessMessage from '@/components/checkout/quick-checkout/OrderSuccessMessage';
import ProductSummary from '@/components/checkout/quick-checkout/ProductSummary';
import ProductNotFound from '@/components/checkout/quick-checkout/ProductNotFound';
import { useProductCheckout } from '@/hooks/useProductCheckout';
import { useProducts } from '@/contexts/ProductContext';
import { useToast } from '@/hooks/use-toast';
import CheckoutProgress from '@/components/checkout/CheckoutProgress';

const QuickCheckout = () => {
  const { productId } = useParams<{ productId: string }>();
  const { settings } = useAsaas();
  const { products } = useProducts();
  const location = useLocation();
  const { toast } = useToast();
  
  console.log(`QuickCheckout - Rota atual: ${location.pathname}`);
  console.log(`QuickCheckout - Iniciando com productId: ${productId}`);
  console.log('QuickCheckout - Produtos disponíveis:', products);
  
  // Display products slugs for debugging
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('QuickCheckout - Slugs dos produtos disponíveis:');
      products.forEach(p => console.log(`- ${p.slug} (ID: ${p.id})`));
    }
  }, [products]);
  
  // Using useProductCheckout for improved slug-based product fetching
  const {
    product,
    loading,
    productNotFound
  } = useProductCheckout(productId);
  
  useEffect(() => {
    console.log('QuickCheckout - Status do carregamento:', loading);
    console.log('QuickCheckout - Produto encontrado:', product);
    console.log('QuickCheckout - Produto não encontrado:', productNotFound);
    
    if (productNotFound) {
      toast({
        title: "Produto não encontrado",
        description: `Não foi possível encontrar o produto com o identificador "${productId}".`,
        variant: "destructive",
      });
    }
  }, [product, loading, productNotFound, productId, toast]);
  
  const {
    paymentMethod,
    setPaymentMethod,
    customerDetails,
    setCustomerDetails,
    isOrderSubmitted,
    handleSubmitCustomerInfo,
    handlePaymentSubmit
  } = useQuickCheckout(productId, product);
  
  if (loading) {
    return (
      <CheckoutContainer>
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">Carregando dados do produto...</span>
        </div>
      </CheckoutContainer>
    );
  }
  
  if (!product || productNotFound) {
    console.log(`QuickCheckout - Exibindo tela de produto não encontrado para slug: ${productId}`);
    return (
      <CheckoutContainer>
        <ProductNotFound slug={productId} />
      </CheckoutContainer>
    );
  }
  
  // Prepare product details for checkout progress component
  const productDetails = {
    id: product.id,
    name: product.nome,
    price: product.preco,
    image: product.urlImagem, // Corrigindo de imageUrl para image
    description: product.descricao,
    isDigital: product.digital
  };
  
  // Use CheckoutProgress component if requested in URL parameter
  const useFullCheckout = new URLSearchParams(location.search).get('fullCheckout') === 'true';
  
  if (useFullCheckout) {
    return (
      <CheckoutContainer>
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Checkout Completo</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckoutProgress 
              paymentMethod={paymentMethod === 'CREDIT_CARD' ? 'card' : 'pix'} 
              setPaymentMethod={(method) => setPaymentMethod(method === 'card' ? 'CREDIT_CARD' : 'PIX')} 
              productDetails={productDetails}
              handlePayment={() => handlePaymentSubmit({})} 
              isProcessing={false} 
            />
          </CardContent>
        </Card>
      </CheckoutContainer>
    );
  }
  
  return (
    <CheckoutContainer>
      <Card className="mb-6 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Checkout Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          {product && <ProductSummary product={product} />}
          
          {!customerDetails.name ? (
            <CustomerForm 
              customerDetails={customerDetails}
              setCustomerDetails={setCustomerDetails}
              onSubmit={handleSubmitCustomerInfo}
            />
          ) : !isOrderSubmitted ? (
            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-3">Forma de Pagamento</h3>
                
                <PaymentMethodSelector 
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  settings={settings}
                />
                
                {paymentMethod === 'CREDIT_CARD' && (
                  <CheckoutForm 
                    onSubmit={handlePaymentSubmit} 
                    isSandbox={settings.sandboxMode}
                    isDigitalProduct={product.digital}
                    useCustomProcessing={product.usarProcessamentoPersonalizado}
                    manualCardStatus={product.statusCartaoManual}
                  />
                )}
                
                {paymentMethod === 'PIX' && (
                  <PixPayment 
                    onSubmit={handlePaymentSubmit}
                    isSandbox={settings.sandboxMode}
                    isDigitalProduct={product.digital}
                  />
                )}
              </div>
            </div>
          ) : (
            <OrderSuccessMessage paymentMethod={paymentMethod} />
          )}
        </CardContent>
      </Card>
    </CheckoutContainer>
  );
};

export default QuickCheckout;
