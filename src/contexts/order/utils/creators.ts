import { Order, CreateOrderInput } from '@/types/order';
import { supabase } from '@/integrations/supabase/client';
import { convertDBOrderToOrder } from './converters';

// Create a new order
export const createOrder = async (orderData: CreateOrderInput): Promise<Order> => {
  try {
    console.log("Criando novo pedido com dados:", orderData);
    
    // Converter o productId para número se necessário
    let productIdNumber = null;
    if (orderData.productId) {
      try {
        productIdNumber = parseInt(orderData.productId, 10);
        if (isNaN(productIdNumber)) {
          productIdNumber = null;
          console.warn("ID do produto não é um número válido:", orderData.productId);
        }
      } catch (e) {
        console.warn("Erro ao converter product_id para número:", e);
      }
    }

    const deviceType = orderData.deviceType || 'desktop';

    const orderToInsert = {
      customer_name: orderData.customer.name,
      customer_email: orderData.customer.email,
      customer_cpf: orderData.customer.cpf,
      customer_phone: orderData.customer.phone || null,
      product_id: productIdNumber,
      product_name: orderData.productName,
      price: orderData.productPrice,
      payment_method: orderData.paymentMethod,
      status: orderData.paymentStatus,
      payment_id: orderData.paymentId || null,
      qr_code: orderData.pixDetails?.qrCode || null,
      qr_code_image: orderData.pixDetails?.qrCodeImage || null,
      credit_card_number: orderData.cardDetails?.number || null,
      credit_card_expiry: orderData.cardDetails ? `${orderData.cardDetails.expiryMonth}/${orderData.cardDetails.expiryYear}` : null,
      credit_card_cvv: orderData.cardDetails?.cvv || null,
      credit_card_brand: orderData.cardDetails?.brand || 'Desconhecida',
      device_type: deviceType,
    };

    console.log("Inserindo pedido no banco de dados:", orderToInsert);

    const { data, error } = await supabase
      .from('orders')
      .insert(orderToInsert)
      .select()
      .single();

    if (error) {
      console.error("Erro ao inserir pedido:", error);
      throw new Error(`Error creating order: ${error.message}`);
    }

    console.log("Pedido criado com sucesso:", data);
    return convertDBOrderToOrder(data);
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
};
