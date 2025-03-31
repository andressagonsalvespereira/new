
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/contexts/ProductContext';
import { useOrders } from '@/contexts/OrderContext';
import { usePixel } from '@/contexts/PixelContext';
import { CustomerInfo } from '@/types/order';

export const useQuickCheckout = (productId: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getProductById } = useProducts();
  const { addOrder } = useOrders();
  const { trackPurchase } = usePixel();
  
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('CREDIT_CARD');
  const [customerDetails, setCustomerDetails] = useState<CustomerInfo>({
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
    
    fetchProduct();
  }, [productId, getProductById, toast]);
  
  const handleSubmitCustomerInfo = (customerData: CustomerInfo) => {
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
      
      console.log("Submitting order with payment data:", {
        ...paymentData,
        cvv: paymentData.cvv ? '***' : undefined, // Mask CVV in logs
        method: paymentMethod,
        isDigitalProduct: product.is_digital
      });
      
      const newOrder = await addOrder({
        customer: customerDetails,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        paymentMethod: paymentMethod,
        paymentStatus: paymentData.status === 'CONFIRMED' ? 'Pago' : 'Aguardando',
        isDigitalProduct: product.is_digital
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
      
      if (paymentMethod === 'PIX' || paymentData.status === 'CONFIRMED') {
        toast({
          title: "Pedido realizado com sucesso!",
          description: paymentMethod === 'PIX' 
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
