
import { Order, PaymentStatus, PaymentMethod, DeviceType, CardDetails, PixDetails } from '@/types/order';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';
import { CustomerData } from '@/components/checkout/payment/shared/types';
import { detectDeviceType } from '../utils/deviceDetection';
import { useOrders } from '@/contexts/order';
import { useToast } from '@/hooks/use-toast';

interface CreateOrderServiceProps {
  customerData: CustomerData;
  productDetails: ProductDetailsType;
  status: 'pending' | 'confirmed';
  paymentId: string;
  cardDetails?: CardDetails;
  pixDetails?: PixDetails;
  toast: ReturnType<typeof useToast>['toast'];
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
  
  // Garantir que a marca do cartão seja definida para um valor padrão se não fornecida
  if (cardDetails && !cardDetails.brand) {
    cardDetails.brand = 'Desconhecida';
  }
  
  // Detect device type in a type-safe way
  const deviceType: DeviceType = detectDeviceType();
  
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
    deviceType,
    isDigitalProduct: productDetails.isDigital
  };
  
  try {
    const newOrder = await addOrder(orderData);
    
    toast({
      title: "Pedido criado",
      description: "Seu pedido foi registrado com sucesso!",
    });
    
    return newOrder;
  } catch (error) {
    toast({
      title: "Erro no pedido",
      description: "Não foi possível finalizar o pedido. Tente novamente.",
      variant: "destructive",
    });
    throw error;
  }
};
