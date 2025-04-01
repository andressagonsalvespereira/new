
import { useOrders } from '@/contexts/OrderContext';
import { Order, PaymentStatus, PaymentMethod } from '@/types/order';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';
import { CustomerData } from '@/components/checkout/utils/payment/types';

interface CreateOrderServiceProps {
  customerData: CustomerData;
  productDetails: ProductDetailsType;
  status: 'pending' | 'confirmed';
  paymentId: string;
  cardDetails?: any;
  pixDetails?: any;
  toast: any;
}

/**
 * Service to handle order creation
 */
export const createOrderService = async ({
  customerData,
  productDetails,
  status,
  paymentId,
  cardDetails,
  pixDetails,
  toast
}: CreateOrderServiceProps): Promise<Order> => {
  const { addOrder } = useOrders();
  
  console.log("Criando pedido com detalhes do produto:", {
    id: productDetails.id,
    name: productDetails.name,
    price: productDetails.price,
    isDigital: productDetails.isDigital
  });
  console.log("Estado do pedido:", status);
  console.log("Detalhes do cliente:", {
    name: customerData.name,
    email: customerData.email,
    cpf: customerData.cpf,
    phone: customerData.phone,
    hasAddress: !!customerData.address
  });
  
  // Garantir que a marca do cartão seja definida para um valor padrão se não fornecida
  if (cardDetails && !cardDetails.brand) {
    cardDetails.brand = 'Desconhecida';
  }
  
  const orderData = {
    customer: customerData,
    productId: productDetails.id,
    productName: productDetails.name,
    productPrice: productDetails.price,
    paymentMethod: cardDetails ? 'CREDIT_CARD' as PaymentMethod : 'PIX' as PaymentMethod,
    paymentStatus: status === 'pending' ? 'Aguardando' as PaymentStatus : 'Pago' as PaymentStatus,
    paymentId: paymentId,
    cardDetails,
    pixDetails,
    orderDate: new Date().toISOString(),
    deviceType: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    isDigitalProduct: productDetails.isDigital
  };

  console.log("Enviando dados do pedido:", {
    productId: orderData.productId,
    productName: orderData.productName,
    productPrice: orderData.productPrice,
    paymentMethod: orderData.paymentMethod,
    customerName: orderData.customer.name,
    customerEmail: orderData.customer.email
  });
  
  try {
    const newOrder = await addOrder(orderData);
    console.log("Pedido criado com sucesso:", {
      id: newOrder.id,
      productName: newOrder.productName,
      productPrice: newOrder.productPrice,
      paymentMethod: newOrder.paymentMethod,
      paymentStatus: newOrder.paymentStatus
    });
    
    toast({
      title: "Pedido criado",
      description: "Seu pedido foi registrado com sucesso!",
    });
    
    return newOrder;
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    toast({
      title: "Erro no pedido",
      description: "Não foi possível finalizar o pedido. Tente novamente.",
      variant: "destructive",
    });
    throw error;
  }
};
