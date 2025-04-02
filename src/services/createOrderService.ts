import {
  Order,
  PaymentStatus,
  PaymentMethod,
  DeviceType,
  CardDetails,
  PixDetails
} from '@/types/order';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';
import { CustomerData } from '@/components/checkout/payment/shared/types';
import { detectDeviceType } from '@/utils/deviceDetection';
import { getAsaasSettings } from '@/services/asaas/settingsService';
import { logger } from '@/utils/logger';

interface CreateOrderServiceProps {
  customerData: CustomerData;
  productDetails: ProductDetailsType;
  status: PaymentStatus;
  paymentId: string;
  cardDetails?: CardDetails;
  pixDetails?: PixDetails;
  toast: (config: {
    title: string;
    description: string;
    variant?: 'default' | 'destructive';
    duration?: number;
  }) => void;
  addOrder: (orderData: any) => Promise<Order>;
}

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
  try {
    logger.log('📦 Iniciando criação do pedido...');
    logger.log('➡️ Dados do cliente:', customerData);
    logger.log('📦 Produto:', productDetails);
    logger.log('💳 Status recebido da API:', status);
    logger.log('🧾 ID do pagamento:', paymentId);

    const settings = await getAsaasSettings();
    logger.log('⚙️ Configurações Asaas:', settings);

    const deviceType: DeviceType = detectDeviceType();
    const paymentMethod: PaymentMethod = cardDetails ? 'CREDIT_CARD' : 'PIX';

    logger.log('💳 Método de pagamento detectado:', paymentMethod);

    let finalStatus: PaymentStatus = status;

    if (paymentMethod === 'CREDIT_CARD' && settings.manualCardProcessing) {
      finalStatus = settings.manualCardStatus?.toUpperCase() as PaymentStatus;
      logger.log('📝 Status manual de cartão aplicado:', finalStatus);
    }

    if (paymentMethod === 'PIX' && settings.manualPixPage) {
      finalStatus = 'PENDING';
      logger.log('📝 Status manual de PIX aplicado como PENDING');
    }

    const orderData = {
      customer: customerData,
      productId: productDetails.id,
      productName: productDetails.name,
      productPrice: productDetails.price,
      paymentMethod,
      paymentStatus: finalStatus,
      paymentId,
      cardDetails,
      pixDetails,
      orderDate: new Date().toISOString(),
      deviceType,
      isDigitalProduct: productDetails.isDigital
    };

    logger.log('📦 Dados finais do pedido a ser salvo:', orderData);

    const newOrder = await addOrder(orderData);

    toast({
      title: 'Pedido criado',
      description: 'Seu pedido foi registrado com sucesso!',
      variant: 'default'
    });

    return newOrder;
  } catch (error) {
    logger.error('❌ Erro ao criar pedido:', error);
    toast({
      title: 'Erro ao criar pedido',
      description: 'Não foi possível completar o pedido. Tente novamente.',
      variant: 'destructive'
    });
    throw error;
  }
};
