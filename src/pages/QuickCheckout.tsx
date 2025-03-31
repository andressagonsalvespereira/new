
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import PixPayment from '@/components/checkout/PixPayment';
import { useAsaas } from '@/contexts/AsaasContext';
import { useProducts } from '@/contexts/ProductContext';
import { useOrders } from '@/contexts/OrderContext';
import { usePixel } from '@/contexts/PixelContext';

const QuickCheckout = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useAsaas();
  const { getProductById } = useProducts();
  const { addOrder } = useOrders();
  const { trackPurchase } = usePixel();
  
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: ''
  });
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  
  useEffect(() => {
    async function fetchProduct() {
      try {
        if (!productId) {
          throw new Error('ID do produto não fornecido');
        }
        
        const productData = await getProductById(productId);
        if (!productData) {
          throw new Error('Produto não encontrado');
        }
        
        setProduct(productData);
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do produto.",
          variant: "destructive",
        });
        
        // Redirect to home page after error
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProduct();
  }, [productId, getProductById, navigate, toast, trackPurchase]);
  
  const handleSubmitCustomerInfo = (customerData: any) => {
    setCustomerDetails(customerData);
  };
  
  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      const orderData = {
        product: product,
        customer: customerDetails,
        payment: {
          method: paymentMethod,
          ...paymentData
        }
      };
      
      const newOrder = await addOrder({
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        customerCpf: customerDetails.cpf,
        paymentMethod: paymentMethod,
        status: paymentData.status === 'CONFIRMED' ? 'Pago' : 'Aguardando'
      });
      
      setIsOrderSubmitted(true);
      
      // Track purchase event
      trackPurchase({
        value: product.price,
        transactionId: `order-${newOrder.id}`,
        products: [{
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }]
      });
      
      if (paymentMethod === 'pix' || paymentData.status === 'CONFIRMED') {
        toast({
          title: "Pedido realizado com sucesso!",
          description: paymentMethod === 'pix' 
            ? "Utilize o QR code PIX para finalizar o pagamento." 
            : "Seu pagamento foi aprovado.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar seu pagamento. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  if (loading) {
    return (
      <CheckoutContainer>
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </CheckoutContainer>
    );
  }
  
  if (!product) {
    return (
      <CheckoutContainer>
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Produto não encontrado</h2>
            <p className="text-gray-600 mb-4">
              O produto que você está procurando não existe ou foi removido.
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
  
  return (
    <CheckoutContainer>
      <Card className="mb-6 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Checkout Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
            <div className="text-right font-bold text-lg">
              R$ {product.price.toFixed(2)}
            </div>
          </div>
          
          {!customerDetails.name ? (
            <div className="space-y-4">
              <h3 className="font-semibold">Informações do Cliente</h3>
              <div className="space-y-3">
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nome completo"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                />
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="E-mail"
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                />
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="CPF"
                  value={customerDetails.cpf}
                  onChange={(e) => setCustomerDetails({...customerDetails, cpf: e.target.value})}
                />
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Telefone"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                />
                <Button 
                  onClick={() => handleSubmitCustomerInfo(customerDetails)}
                  disabled={!customerDetails.name || !customerDetails.email || !customerDetails.cpf}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Continuar para Pagamento
                </Button>
              </div>
            </div>
          ) : !isOrderSubmitted ? (
            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-3">Forma de Pagamento</h3>
                
                <div className="flex space-x-4 mb-4">
                  {settings.allowCreditCard && (
                    <button
                      className={`flex-1 py-2 px-4 rounded-md border ${
                        paymentMethod === 'card' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      Cartão de Crédito
                    </button>
                  )}
                  
                  {settings.allowPix && (
                    <button
                      className={`flex-1 py-2 px-4 rounded-md border ${
                        paymentMethod === 'pix' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setPaymentMethod('pix')}
                    >
                      PIX
                    </button>
                  )}
                </div>
                
                {paymentMethod === 'card' && (
                  <CheckoutForm 
                    onSubmit={handlePaymentSubmit} 
                    isSandbox={settings.sandboxMode} 
                  />
                )}
                
                {paymentMethod === 'pix' && (
                  <PixPayment 
                    onSubmit={handlePaymentSubmit}
                    productPrice={product.price}
                    isSandbox={settings.sandboxMode}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <h3 className="font-semibold text-green-600 mb-2">
                Pedido Realizado com Sucesso!
              </h3>
              <p className="text-gray-600 mb-4">
                {paymentMethod === 'pix' 
                  ? 'Utilize o QR code PIX abaixo para finalizar seu pagamento.' 
                  : 'Seu pagamento foi processado com sucesso. Você receberá um e-mail com os detalhes do pedido.'}
              </p>
              {paymentMethod === 'card' && (
                <Button
                  onClick={() => navigate('/')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Voltar para a página inicial
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </CheckoutContainer>
  );
};

export default QuickCheckout;
