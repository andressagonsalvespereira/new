import { Order, PaymentStatus, PaymentMethod, DeviceType, CardDetails, PixDetails } from '@/types/order';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';
import { CustomerData } from '@/components/checkout/payment/shared/types';
import { detectDeviceType } from '@/utils/deviceDetection';
import { logger } from '@/utils/logger';

interface CreateOrderServiceProps {
  customerData: CustomerData;
  productDetails: ProductDetailsType;
  status: PaymentStatus;
  paymentId: string;
  cardDetails?: CardDetails;
  pixDetails?: PixDetails;
  toast: (config: { title: string; description: string; variant?: "default" | "destructive"; duration?: number }) => void;
  addOrder: (orderData: any) => Promise<Order>;
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
  toast,
  addOrder
}: CreateOrderServiceProps): Promise<Order> => {
  // Garantir que a marca do cartão seja definida para um valor padrão se não fornecida
  if (cardDetails && !cardDetails.brand) {
    cardDetails.brand = 'Unknown';
  }

  const deviceType: DeviceType = detectDeviceType();

  const orderData = {
    customer: customerData,
    productId: productDetails.id,
    productName: productDetails.name,
    productPrice: productDetails.price,
    paymentMethod: cardDetails ? 'CREDIT_CARD' as PaymentMethod : 'PIX' as PaymentMethod,
    paymentStatus: status,
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
      variant: "default",
    });

    return newOrder;
  } catch (error) {
    logger.error('Erro ao criar pedido:', error);

    toast({
      title: "Erro ao criar pedido",
      description: "Não foi possível completar o pedido. Tente novamente.",
      variant: "destructive",
    });
    throw error;
  }
};
