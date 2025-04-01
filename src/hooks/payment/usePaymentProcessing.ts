
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/contexts/OrderContext';
import { usePixel } from '@/contexts/PixelContext';
import { CustomerInfo } from '@/types/order';
import { Product } from '@/types/product';

export const usePaymentProcessing = (
  product: Product | null,
  customerDetails: CustomerInfo
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addOrder } = useOrders();
  const { trackPurchase } = usePixel();
  
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('CREDIT_CARD');
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  
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
          qrCode: paymentData.qrCodeBase64,
          qrCodeImage: paymentData.qrCodeImage,
          expirationDate: paymentData.expirationDate
        } : undefined
      });
      
      console.log("Order successfully created:", newOrder);
      
      setIsOrderSubmitted(true);
      
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
    paymentMethod,
    setPaymentMethod,
    isOrderSubmitted,
    handlePaymentSubmit
  };
};
