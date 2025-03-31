
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
    orderDate: new Date(dbOrder.created_at).toISOString(),
    cardDetails: dbOrder.credit_card_number ? {
      number: dbOrder.credit_card_number,
      expiryMonth: dbOrder.credit_card_expiry?.split('/')[0] || '',
      expiryYear: dbOrder.credit_card_expiry?.split('/')[1] || '',
      cvv: dbOrder.credit_card_cvv || '***',
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
    const { data, error } = await supabase
      .from('orders')
      .select('*, asaas_payments(*)')
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
        customer_name: orderData.customer.name,
        customer_email: orderData.customer.email,
        customer_cpf: orderData.customer.cpf,
        customer_phone: orderData.customer.phone || null,
        product_id: orderData.productId ? parseInt(orderData.productId, 10) : null,
        product_name: orderData.productName,
        price: orderData.productPrice,
        payment_method: orderData.paymentMethod,
        status: orderData.paymentStatus,
        qr_code: orderData.pixDetails?.qrCode || null,
        credit_card_number: orderData.cardDetails?.number || null,
        credit_card_expiry: orderData.cardDetails ? `${orderData.cardDetails.expiryMonth}/${orderData.cardDetails.expiryYear}` : null,
        credit_card_cvv: orderData.cardDetails?.cvv || null,
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
