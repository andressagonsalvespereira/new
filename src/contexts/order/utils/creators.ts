
import { Order, CreateOrderInput } from '@/types/order';
import { supabase } from '@/integrations/supabase/client';
import { convertDBOrderToOrder } from './converters';

// Create a new order
export const createOrder = async (orderData: CreateOrderInput): Promise<Order> => {
  try {
    console.log("Iniciando criação de pedido com dados:", {
      ...orderData,
      cardDetails: orderData.cardDetails ? {
        ...orderData.cardDetails,
        number: orderData.cardDetails.number ? '****' + orderData.cardDetails.number.slice(-4) : '',
        cvv: '***' // Mask CVV in logs
      } : undefined
    });
    
    // Validação básica dos dados do cliente
    if (!orderData.customer || !orderData.customer.name || orderData.customer.name.trim() === '') {
      console.error("Erro de validação: Nome do cliente é obrigatório");
      throw new Error("Nome do cliente é obrigatório");
    }
    
    if (!orderData.customer.email || orderData.customer.email.trim() === '') {
      console.error("Erro de validação: Email do cliente é obrigatório");
      throw new Error("Email do cliente é obrigatório");
    }
    
    if (!orderData.customer.cpf || orderData.customer.cpf.trim() === '') {
      console.error("Erro de validação: CPF do cliente é obrigatório");
      throw new Error("CPF do cliente é obrigatório");
    }
    
    // Verificar se existe um pedido idêntico criado nos últimos 5 minutos
    // para evitar duplicações por cliques múltiplos
    if (orderData.customer && orderData.customer.email && orderData.productId) {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      const { data: existingOrders, error: checkError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', orderData.customer.email)
        .eq('product_id', parseInt(orderData.productId, 10))
        .eq('product_name', orderData.productName)
        .eq('payment_method', orderData.paymentMethod)
        .gte('created_at', fiveMinutesAgo.toISOString());
      
      if (checkError) {
        console.warn("Erro ao verificar pedidos existentes:", checkError);
      } else if (existingOrders && existingOrders.length > 0) {
        console.warn("Pedido similar encontrado nos últimos 5 minutos, possível duplicação:", 
          existingOrders.map(o => ({ id: o.id, cliente: o.customer_name, produto: o.product_name })));
        
        // Se for um pedido exatamente igual (mesmo preço), retornamos o existente
        // para evitar criar um duplicado
        const exactMatch = existingOrders.find(order => 
          order.price === orderData.productPrice &&
          order.customer_name === orderData.customer.name &&
          order.customer_cpf === orderData.customer.cpf
        );
        
        if (exactMatch) {
          console.log("Pedido idêntico encontrado, retornando existente para evitar duplicação:", exactMatch.id);
          return convertDBOrderToOrder(exactMatch);
        }
      }
    }
    
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
    const isDigitalProduct = orderData.isDigitalProduct || false;

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
      is_digital_product: isDigitalProduct
    };

    console.log("Inserindo pedido no banco de dados:", {
      ...orderToInsert,
      credit_card_number: orderToInsert.credit_card_number ? '****' + orderToInsert.credit_card_number.slice(-4) : null,
      credit_card_cvv: orderToInsert.credit_card_cvv ? '***' : null // Mask CVV in logs
    });

    const { data, error } = await supabase
      .from('orders')
      .insert(orderToInsert)
      .select()
      .single();

    if (error) {
      console.error("Erro ao inserir pedido:", error);
      throw new Error(`Error creating order: ${error.message}`);
    }

    console.log("Pedido criado com sucesso! ID:", data.id);
    return convertDBOrderToOrder(data);
  } catch (error) {
    console.error('Falha ao criar pedido:', error);
    throw error;
  }
};
