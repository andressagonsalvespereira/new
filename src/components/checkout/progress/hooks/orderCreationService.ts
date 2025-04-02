import { CustomerData } from '@/components/checkout/payment/shared/types';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';
import { Order, CardDetails, PixDetails } from '@/types/order';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getAsaasSettings } from '@/services/asaas/settingsService';

interface CreateOrderInput {
  customerData: CustomerData;
  productDetails: ProductDetailsType;
  status: 'pending' | 'confirmed';
  paymentId: string;
  cardDetails?: CardDetails;
  pixDetails?: PixDetails;
  toast: ReturnType<typeof toast>;
  addOrder: (order: Order) => void;
}

export const createOrderService = async ({
  customerData,
  productDetails,
  status,
  paymentId,
  cardDetails,
  pixDetails,
  toast,
  addOrder,
}: CreateOrderInput): Promise<Order> => {
  try {
    const settings = await getAsaasSettings();

    const paymentStatus = settings.manualCardProcessing
      ? settings.manualCardStatus?.toUpperCase()
      : status.toUpperCase();

    const { data, error } = await supabase.from('orders').insert([
      {
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_cpf: customerData.cpf,
        customer_phone: customerData.phone,
        product_id: productDetails.id,
        product_name: productDetails.name,
        price: productDetails.price,
        payment_method: productDetails.selectedPaymentMethod,
        status: paymentStatus,
        credit_card_number: cardDetails?.cardNumber,
        credit_card_expiry: cardDetails?.expiry,
        credit_card_cvv: cardDetails?.cvv,
        credit_card_brand: cardDetails?.brand,
        payment_id: paymentId,
        qr_code: pixDetails?.payload,
        qr_code_image: pixDetails?.qrCodeImage,
        device_type: productDetails.deviceType,
        is_digital_product: productDetails.isDigitalProduct,
      },
    ])
    .select()
    .single();

    if (error) {
      console.error('Erro ao criar pedido:', error);
      throw new Error('Erro ao salvar pedido no banco de dados');
    }

    const newOrder: Order = {
      id: data.id,
      productId: data.product_id,
      productName: data.product_name,
      productPrice: data.price,
      paymentMethod: data.payment_method,
      paymentStatus: data.status,
      cardDetails: cardDetails,
      pixDetails: pixDetails,
    };

    addOrder(newOrder);
    return newOrder;
  } catch (error) {
    console.error('Erro em createOrderService:', error);
    throw error;
  }
};
