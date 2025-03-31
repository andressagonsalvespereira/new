
import { Order, CreateOrderInput, PaymentMethod } from '@/types/order';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Carrega pedidos do Supabase
export const loadOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao carregar pedidos:', error);
      throw error;
    }
    
    // Mapear os dados do banco para o formato da aplicação
    return data.map(item => ({
      id: item.id.toString(),
      customer: {
        name: item.customer_name,
        email: item.customer_email,
        cpf: item.customer_cpf,
        phone: item.customer_phone || '',
        address: undefined // Endereço não está sendo armazenado ainda
      },
      productId: item.product_id ? item.product_id.toString() : '',
      productName: item.product_name,
      productPrice: Number(item.price),
      paymentMethod: mapPaymentMethod(item.payment_method),
      paymentStatus: mapPaymentStatus(item.status),
      orderDate: item.created_at,
      cardDetails: item.credit_card_number ? {
        number: item.credit_card_number,
        expiryMonth: item.credit_card_expiry ? item.credit_card_expiry.split('/')[0] : '',
        expiryYear: item.credit_card_expiry ? item.credit_card_expiry.split('/')[1] : '',
        cvv: item.credit_card_cvv || '',
      } : undefined,
      pixDetails: item.qr_code ? {
        qrCode: item.qr_code,
        qrCodeImage: undefined // QR Code imagem não está sendo armazenado ainda
      } : undefined
    }));
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    // Se falhar, retorna um array vazio
    return [];
  }
};

// Mapeia o método de pagamento do formato do banco para o formato da aplicação
const mapPaymentMethod = (method: string | null): PaymentMethod => {
  if (method === 'PIX') return 'pix';
  if (method === 'CREDIT_CARD') return 'card';
  return 'pix'; // valor padrão
};

// Mapeia o status do pagamento do formato do banco para o formato da aplicação
const mapPaymentStatus = (status: string | null): Order['paymentStatus'] => {
  if (status === 'Aguardando') return 'pending';
  if (status === 'Pago') return 'confirmed';
  if (status === 'Recusado') return 'declined';
  if (status === 'Aguardando Análise Manual') return 'manual_review';
  if (status === 'Aguardando Confirmação Manual') return 'awaiting_manual_confirmation';
  return 'pending'; // valor padrão
};

// Mapeia o status do pagamento do formato da aplicação para o formato do banco
const mapStatusToDatabase = (status: Order['paymentStatus']): string => {
  if (status === 'pending') return 'Aguardando';
  if (status === 'confirmed') return 'Pago';
  if (status === 'declined') return 'Recusado';
  if (status === 'manual_review') return 'Aguardando Análise Manual';
  if (status === 'awaiting_manual_confirmation') return 'Aguardando Confirmação Manual';
  if (status === 'refunded') return 'Recusado'; // Não temos status de reembolso no banco
  if (status === 'cancelled') return 'Recusado'; // Não temos status de cancelamento no banco
  return 'Aguardando';
};

// Mapeia o método de pagamento do formato da aplicação para o formato do banco
const mapPaymentMethodToDatabase = (method: PaymentMethod): string => {
  if (method === 'pix') return 'PIX';
  if (method === 'card') return 'CREDIT_CARD';
  return 'PIX';
};

// Cria um novo pedido
export const createOrder = async (orderData: CreateOrderInput): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_name: orderData.customer.name,
        customer_email: orderData.customer.email,
        customer_cpf: orderData.customer.cpf,
        customer_phone: orderData.customer.phone || '',
        product_id: orderData.productId ? parseInt(orderData.productId) : null,
        product_name: orderData.productName,
        price: orderData.productPrice,
        payment_method: mapPaymentMethodToDatabase(orderData.paymentMethod),
        status: mapStatusToDatabase(orderData.paymentStatus),
        qr_code: orderData.pixDetails?.qrCode,
        credit_card_number: orderData.cardDetails?.number,
        credit_card_expiry: orderData.cardDetails ? 
          `${orderData.cardDetails.expiryMonth}/${orderData.cardDetails.expiryYear}` : null,
        credit_card_cvv: orderData.cardDetails?.cvv
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
    
    // Converter o pedido criado para o formato da aplicação
    return {
      id: data.id.toString(),
      customer: {
        name: data.customer_name,
        email: data.customer_email,
        cpf: data.customer_cpf,
        phone: data.customer_phone || '',
      },
      productId: data.product_id ? data.product_id.toString() : '',
      productName: data.product_name,
      productPrice: Number(data.price),
      paymentMethod: mapPaymentMethod(data.payment_method),
      paymentStatus: mapPaymentStatus(data.status),
      orderDate: data.created_at,
      cardDetails: data.credit_card_number ? {
        number: data.credit_card_number,
        expiryMonth: data.credit_card_expiry ? data.credit_card_expiry.split('/')[0] : '',
        expiryYear: data.credit_card_expiry ? data.credit_card_expiry.split('/')[1] : '',
        cvv: data.credit_card_cvv || '',
      } : undefined,
      pixDetails: data.qr_code ? {
        qrCode: data.qr_code,
      } : undefined
    };
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
};

// Filtra pedidos por método de pagamento
export const filterOrdersByPaymentMethod = (
  orders: Order[],
  method: PaymentMethod
): Order[] => {
  return orders.filter(order => order.paymentMethod === method);
};

// Atualiza o status de um pedido
export const updateOrderStatusData = async (
  orders: Order[],
  id: string,
  status: Order['paymentStatus']
): Promise<{ updatedOrder: Order; updatedOrders: Order[] }> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: mapStatusToDatabase(status)
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
    
    // Converter o pedido atualizado para o formato da aplicação
    const updatedOrder: Order = {
      id: data.id.toString(),
      customer: {
        name: data.customer_name,
        email: data.customer_email,
        cpf: data.customer_cpf,
        phone: data.customer_phone || '',
      },
      productId: data.product_id ? data.product_id.toString() : '',
      productName: data.product_name,
      productPrice: Number(data.price),
      paymentMethod: mapPaymentMethod(data.payment_method),
      paymentStatus: mapPaymentStatus(data.status),
      orderDate: data.created_at,
      cardDetails: data.credit_card_number ? {
        number: data.credit_card_number,
        expiryMonth: data.credit_card_expiry ? data.credit_card_expiry.split('/')[0] : '',
        expiryYear: data.credit_card_expiry ? data.credit_card_expiry.split('/')[1] : '',
        cvv: data.credit_card_cvv || '',
      } : undefined,
      pixDetails: data.qr_code ? {
        qrCode: data.qr_code,
      } : undefined
    };
    
    // Atualiza o pedido na lista local
    const orderIndex = orders.findIndex(o => o.id === id);
    const updatedOrders = [...orders];
    if (orderIndex >= 0) {
      updatedOrders[orderIndex] = updatedOrder;
    }
    
    return { updatedOrder, updatedOrders };
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    throw error;
  }
};
