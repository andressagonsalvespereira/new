
import React from 'react';
import { useParams } from 'react-router-dom';
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

const QuickCheckout = () => {
  const { productId } = useParams<{ productId: string }>();
  const { settings } = useAsaas();
  
  // Using useProductCheckout for improved slug-based product fetching
  const {
    product,
    loading,
    productNotFound
  } = useProductCheckout(productId);
  
  const {
    paymentMethod,
    setPaymentMethod,
    customerDetails,
    setCustomerDetails,
    isOrderSubmitted,
    handleSubmitCustomerInfo,
    handlePaymentSubmit
  } = useQuickCheckout(productId, product);
  
  console.log("QuickCheckout rendering with product ID:", productId);
  console.log("Product data:", product);
  console.log("Loading state:", loading);
  console.log("Product not found state:", productNotFound);
  
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
    return (
      <CheckoutContainer>
        <ProductNotFound slug={productId} />
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
          <ProductSummary product={product} />
          
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
                    isDigitalProduct={product.isDigital || product.digital}
                    useCustomProcessing={product.useCustomProcessing || product.usarProcessamentoPersonalizado}
                    manualCardStatus={product.manualCardStatus || product.statusCartaoManual}
                  />
                )}
                
                {paymentMethod === 'PIX' && (
                  <PixPayment 
                    onSubmit={handlePaymentSubmit}
                    isSandbox={settings.sandboxMode}
                    isDigitalProduct={product.isDigital || product.digital}
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
