
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/contexts/ProductContext';
import { useOrders } from '@/contexts/OrderContext';
import { usePixel } from '@/contexts/PixelContext';
import { CustomerInfo } from '@/types/order';
import { Product } from '@/types/product';

export const useQuickCheckout = (productId: string | undefined, preloadedProduct?: Product | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getProductById } = useProducts();
  const { addOrder } = useOrders();
  const { trackPurchase } = usePixel();
  
  const [product, setProduct] = useState<any | null>(preloadedProduct || null);
  const [loading, setLoading] = useState(!preloadedProduct);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('CREDIT_CARD');
  const [customerDetails, setCustomerDetails] = useState<CustomerInfo>({
    name: '',
    email: '',
    cpf: '',
    phone: ''
  });
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  
  useEffect(() => {
    // If we already have a product from useProductCheckout, skip fetching
    if (preloadedProduct) {
      console.log('useQuickCheckout - Usando produto pré-carregado:', preloadedProduct);
      setProduct(preloadedProduct);
      setLoading(false);
      return;
    }
    
    async function fetchProduct() {
      try {
        if (!productId) {
          console.error('ID do produto não fornecido');
          throw new Error('ID do produto não fornecido');
        }
        
        console.log('Carregando produto com ID:', productId);
        setLoading(true);
        
        const productData = await getProductById(productId);
        
        console.log('Dados do produto carregado:', productData);
        
        if (!productData) {
          console.error('Produto não encontrado para o ID:', productId);
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
      } finally {
        setLoading(false);
      }
    }
    
    if (!preloadedProduct) {
      fetchProduct();
    }
  }, [productId, getProductById, toast, preloadedProduct]);
  
  // If preloadedProduct changes, update the state
  useEffect(() => {
    if (preloadedProduct) {
      setProduct(preloadedProduct);
      setLoading(false);
    }
  }, [preloadedProduct]);
  
  const handleSubmitCustomerInfo = (customerData: CustomerInfo) => {
    console.log('useQuickCheckout - Customer info submitted:', customerData);
    setCustomerDetails(customerData);
  };
  
  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      console.log("Starting handlePaymentSubmit with data:", {
        ...paymentData,
        customerDetails,
        productDetails: product ? {
          id: product.id,
          name: product.nome,
          price: product.preco,
          isDigital: product.digital
        } : 'No product available',
        paymentMethod
      });
      
      if (!product) {
        console.error("Trying to submit payment without product data");
        throw new Error("Dados do produto não disponíveis");
      }
      
      const orderData = {
        product: product,
        customer: customerDetails,
        payment: {
          method: paymentMethod,
          ...paymentData
        }
      };
      
      console.log("Submitting order with payment data:", {
        customerId: customerDetails.name,
        customerEmail: customerDetails.email,
        productId: product.id,
        productName: product.nome,
        productPrice: product.preco,
        paymentMethod,
        cardDetails: paymentData.cardNumber ? {
          brand: paymentData.brand || 'Desconhecida',
          last4: paymentData.cardNumber.slice(-4),
        } : undefined,
        isDigitalProduct: product.digital,
        useCustomProcessing: product.usarProcessamentoPersonalizado,
        manualCardStatus: product.statusCartaoManual
      });
      
      const newOrder = await addOrder({
        customer: customerDetails,
        productId: product.id,
        productName: product.nome,
        productPrice: product.preco,
        paymentMethod: paymentMethod,
        paymentStatus: paymentData.status === 'CONFIRMED' ? 'Pago' : 'Aguardando',
        isDigitalProduct: product.digital,
        cardDetails: paymentData.cardNumber ? {
          number: paymentData.cardNumber,
          expiryMonth: paymentData.expiryMonth,
          expiryYear: paymentData.expiryYear,
          cvv: paymentData.cvv,
          brand: paymentData.brand || 'Desconhecida'
        } : undefined,
        pixDetails: paymentMethod === 'PIX' ? {
          qrCodeBase64: paymentData.qrCodeBase64,
          pixKey: paymentData.pixKey,
          pixCopyPaste: paymentData.pixCopyPaste
        } : undefined
      });
      
      console.log("Order successfully created:", newOrder);
      
      setIsOrderSubmitted(true);
      
      // Track purchase event
      trackPurchase({
        value: product.preco,
        transactionId: `order-${newOrder.id}`,
        products: [{
          id: product.id,
          name: product.nome,
          price: product.preco,
          quantity: 1
        }]
      });
      
      if (paymentMethod === 'PIX' || paymentData.status === 'CONFIRMED') {
        toast({
          title: "Pedido realizado com sucesso!",
          description: paymentMethod === 'PIX' 
            ? "Utilize o QR code PIX para finalizar o pagamento." 
            : "Seu pagamento foi aprovado.",
          duration: 5000,
        });
      }
      
      return newOrder;
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar seu pagamento. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    }
  };

  return {
    product,
    loading,
    paymentMethod,
    setPaymentMethod,
    customerDetails,
    setCustomerDetails,
    isOrderSubmitted,
    handleSubmitCustomerInfo,
    handlePaymentSubmit
  };
};
