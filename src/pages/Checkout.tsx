
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/contexts/ProductContext';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import { useAsaas } from '@/contexts/AsaasContext';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';
import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import ProductNotFound from '@/components/checkout/quick-checkout/ProductNotFound';

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

  // Efeito para carregar o produto
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        let product = null;
        
        // Se temos um slug, buscar pelo slug
        if (productSlug) {
          product = await getProductBySlug(productSlug);
        } 
        // Sem slug, usar o primeiro produto disponível
        else if (products && products.length > 0) {
          product = products[0];
        }
        
        if (product) {
          console.log("Produto encontrado:", product);
          setSelectedProduct(product);
        } else {
          console.log("Produto não encontrado");
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

  // Ajusta o método de pagamento com base nas configurações
  useEffect(() => {
    if (settings) {
      if (paymentMethod === 'card' && !settings.allowCreditCard) {
        if (settings.allowPix) {
          setPaymentMethod('pix');
        }
      } else if (paymentMethod === 'pix' && !settings.allowPix) {
        if (settings.allowCreditCard) {
          setPaymentMethod('card');
        }
      }
    }
  }, [settings, paymentMethod]);

  const handlePayment = () => {
    console.log("Pagamento finalizado");
    setIsProcessing(false);
    navigate('/payment-success');
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

  // Prepare product details for checkout progress component
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
          <CheckoutProgress 
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
