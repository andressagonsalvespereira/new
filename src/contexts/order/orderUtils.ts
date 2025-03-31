
import { Order, CreateOrderInput, CustomerInfo, PaymentMethod, PaymentStatus } from '@/types/order';
import { supabase } from '@/integrations/supabase/client';

// Helper function to convert database order to frontend Order type
const convertDBOrderToOrder = (dbOrder: any): Order => {
  // Parse customer info
  const customer: CustomerInfo = {
    name: dbOrder.customer_name,
    email: dbOrder.customer_email,
    cpf: dbOrder.customer_cpf,
    phone: dbOrder.customer_phone || '',
  };

  return {
    id: dbOrder.id.toString(),
    customer,
    productId: dbOrder.product_id?.toString() || '',
    productName: dbOrder.product_name,
    productPrice: dbOrder.price,
    paymentMethod: dbOrder.payment_method as PaymentMethod,
    paymentStatus: dbOrder.status as PaymentStatus,
    paymentId: dbOrder.payment_id,
    orderDate: dbOrder.created_at ? new Date(dbOrder.created_at).toISOString() : new Date().toISOString(),
    cardDetails: dbOrder.credit_card_number ? {
      number: dbOrder.credit_card_number,
      expiryMonth: dbOrder.credit_card_expiry?.split('/')[0] || '',
      expiryYear: dbOrder.credit_card_expiry?.split('/')[1] || '',
      cvv: dbOrder.credit_card_cvv || '***',
      brand: dbOrder.credit_card_brand || 'Desconhecida'
    } : undefined,
    pixDetails: dbOrder.qr_code ? {
      qrCode: dbOrder.qr_code,
      qrCodeImage: dbOrder.qr_code_image,
    } : undefined,
  };
};

// Load all orders from the database
export const loadOrders = async (): Promise<Order[]> => {
  try {
    console.log("Carregando pedidos do banco de dados...");
    
    const { data, error } = await supabase
      .from('orders')
      .select('*, asaas_payments(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao carregar pedidos:", error);
      throw new Error(`Error loading orders: ${error.message}`);
    }

    console.log("Pedidos carregados do banco de dados:", data);
    
    if (!data || data.length === 0) {
      console.log("Nenhum pedido encontrado no banco de dados");
      return [];
    }

    return data.map(convertDBOrderToOrder);
  } catch (error) {
    console.error('Failed to load orders:', error);
    throw error;
  }
};

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

// Filter orders by payment method
export const filterOrdersByPaymentMethod = (orders: Order[], method: PaymentMethod): Order[] => {
  return orders.filter(order => order.paymentMethod === method);
};

// Update order status
export const updateOrderStatusData = async (
  orders: Order[], 
  id: string, 
  status: PaymentStatus
): Promise<{ updatedOrder: Order; updatedOrders: Order[] }> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', parseInt(id, 10))
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating order status: ${error.message}`);
    }

    const updatedOrder = convertDBOrderToOrder(data);
    const updatedOrders = orders.map(order => 
      order.id === id ? updatedOrder : order
    );

    return { updatedOrder, updatedOrders };
  } catch (error) {
    console.error(`Failed to update order status for order ${id}:`, error);
    throw error;
  }
};
