
import { Order, CreateOrderInput } from '@/types/order';
import { supabase } from '@/integrations/supabase/client';

// Helper function to convert database order to frontend Order type
const convertDBOrderToOrder = (dbOrder: any): Order => {
  return {
    id: dbOrder.id.toString(),
    customerName: dbOrder.customer_name,
    customerEmail: dbOrder.customer_email,
    customerCpf: dbOrder.customer_cpf,
    customerPhone: dbOrder.customer_phone || '',
    productId: dbOrder.product_id?.toString() || '',
    productName: dbOrder.product_name,
    price: dbOrder.price,
    paymentMethod: dbOrder.payment_method,
    paymentStatus: dbOrder.status,
    qrCode: dbOrder.qr_code || null,
    creditCardNumber: dbOrder.credit_card_number || null,
    creditCardExpiry: dbOrder.credit_card_expiry || null,
    createdAt: new Date(dbOrder.created_at).toISOString(),
    updatedAt: new Date(dbOrder.updated_at).toISOString(),
  };
};

// Load all orders from the database
export const loadOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error loading orders: ${error.message}`);
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
    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_cpf: orderData.customerCpf,
        customer_phone: orderData.customerPhone || null,
        product_id: orderData.productId ? parseInt(orderData.productId, 10) : null,
        product_name: orderData.productName,
        price: orderData.price,
        payment_method: orderData.paymentMethod,
        status: orderData.status || 'Aguardando',
        qr_code: orderData.qrCode || null,
        credit_card_number: orderData.creditCardNumber || null,
        credit_card_expiry: orderData.creditCardExpiry || null,
        credit_card_cvv: orderData.creditCardCvv || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating order: ${error.message}`);
    }

    return convertDBOrderToOrder(data);
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
};

// Filter orders by payment method
export const filterOrdersByPaymentMethod = (orders: Order[], method: 'pix' | 'card'): Order[] => {
  const paymentMethod = method === 'pix' ? 'PIX' : 'CREDIT_CARD';
  return orders.filter(order => order.paymentMethod === paymentMethod);
};

// Update order status
export const updateOrderStatusData = async (
  orders: Order[], 
  id: string, 
  status: Order['paymentStatus']
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
