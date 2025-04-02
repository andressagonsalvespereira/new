import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/contexts/ProductContext';
import { useAsaas } from '@/contexts/AsaasContext';
import { useOrders } from '@/contexts/OrderContext';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';
import CheckoutProgressContainer from '@/components/checkout/progress/CheckoutProgressContainer';
import ProductNotFound from '@/components/checkout/quick-checkout/ProductNotFound';
import { PaymentMethod, PaymentStatus } from '@/types/order';

const Checkout: React.FC = () => {
  const { productSlug } = useParams<{ productSlug?: string }>();
  const { products, getProductById, getProductBySlug } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useAsaas();
  const { addOrder } = useOrders();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        let product = null;
        if (productSlug) {
          product = await getProductBySlug(productSlug);
        } else if (products && products.length > 0) {
          product = products[0];
        }

        if (product) {
          setSelectedProduct(product);
        } else {
          toast({
            title: "Produto não encontrado",
            description: productSlug 
              ? `Não encontramos o produto "${productSlug}"`
              : "Nenhum produto disponível",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
        toast({
          title: "Erro ao carregar produto",
          description: "Ocorreu um erro ao tentar carregar os detalhes do produto.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug, products, getProductBySlug, getProductById, toast]);

  useEffect(() => {
    if (settings) {
      if (paymentMethod === 'card' && !settings.allowCreditCard && settings.allowPix) {
        setPaymentMethod('pix');
      } else if (paymentMethod === 'pix' && !settings.allowPix && settings.allowCreditCard) {
        setPaymentMethod('card');
      }
    }
  }, [settings, paymentMethod]);

  const handlePayment = async (paymentData: any) => {
    setIsProcessing(true);
    try {
      if (!selectedProduct) throw new Error("Produto não disponível");

      const paymentMethodEnum: PaymentMethod = paymentMethod === 'card' ? 'CREDIT_CARD' : 'PIX';
      const paymentStatusEnum: PaymentStatus = paymentData.status === 'confirmed' ? 'PAID' : 'PENDING';

      const orderData = {
        customer: paymentData.customerData || {
          name: paymentData.customerName || "Cliente",
          email: paymentData.customerEmail || "cliente@exemplo.com",
          cpf: paymentData.customerCpf || "00000000000",
          phone: paymentData.customerPhone || ""
        },
        productId: selectedProduct.id,
        productName: selectedProduct.nome,
        productPrice: selectedProduct.preco,
        paymentMethod: paymentMethodEnum,
        paymentStatus: paymentData.status === 'denied' ? 'DENIED' : paymentStatusEnum,
        isDigitalProduct: selectedProduct.digital,
        cardDetails: paymentMethod === 'card' ? paymentData.cardDetails : undefined,
        pixDetails: paymentMethod === 'pix' ? paymentData.pixDetails : undefined
      };

      const createdOrder = await addOrder(orderData);

      toast({
        title: "Pedido realizado com sucesso!",
        description: paymentMethod === 'pix'
          ? "Utilize o QR code PIX para finalizar o pagamento."
          : "Seu pagamento foi processado.",
        duration: 5000,
      });

      // ✅ Redirecionamento com `state` do pedido completo
      if (orderData.paymentStatus === 'DENIED') {
        navigate('/payment-failed', { state: { orderData: createdOrder } });
      } else {
        navigate('/payment-success', { state: { orderData: createdOrder } });
      }

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar seu pedido. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

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

  if (!selectedProduct) {
    return (
      <CheckoutContainer>
        <ProductNotFound slug={productSlug || 'Produto não encontrado'} />
      </CheckoutContainer>
    );
  }

  const productDetails = {
    id: selectedProduct.id,
    name: selectedProduct.nome,
    price: selectedProduct.preco,
    image: selectedProduct.urlImagem,
    description: selectedProduct.descricao,
    isDigital: selectedProduct.digital
  };

  return (
    <CheckoutContainer>
      <Card className="mb-6 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Finalizar Compra</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckoutProgressContainer 
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            productDetails={productDetails}
            handlePayment={handlePayment}
            isProcessing={isProcessing}
          />
        </CardContent>
      </Card>
    </CheckoutContainer>
  );
};

export default Checkout;
