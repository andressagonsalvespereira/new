
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/contexts/OrderContext';
import { CreateOrderInput, CardDetails, PixDetails, PaymentMethod, PaymentStatus, Order } from '@/types/order';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';
import { CustomerData } from '@/components/checkout/utils/payment/types';

interface UseCheckoutContainerOrderProps {
  formState: {
    fullName: string;
    email: string;
    cpf: string;
    phone: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    selectedShipping: string;
    deliveryEstimate: string;
    formErrors: Record<string, string>;
  };
  productDetails: ProductDetailsType;
  handlePayment: (paymentData: any) => void;
}

export const useCheckoutContainerOrder = ({
  formState,
  productDetails,
  handlePayment
}: UseCheckoutContainerOrderProps) => {
  const { addOrder } = useOrders();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  
  // Reset processing state after a timeout (safety mechanism)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isProcessing) {
      timeout = setTimeout(() => {
        setIsProcessing(false);
        processingRef.current = false;
        console.log("Resetando estado de processamento após timeout de segurança");
      }, 30000); // 30 segundos
    }
    
    return () => {
      clearTimeout(timeout);
    };
  }, [isProcessing]);
  
  const validateCustomerData = (customerData: CustomerData): string | null => {
    if (!customerData.name || customerData.name.trim().length < 3) {
      return "Nome completo é obrigatório (mínimo 3 caracteres)";
    }
    
    if (!customerData.email || !customerData.email.includes('@')) {
      return "E-mail inválido";
    }
    
    const cpf = customerData.cpf ? customerData.cpf.replace(/\D/g, '') : '';
    if (!cpf || cpf.length !== 11) {
      return "CPF inválido";
    }
    
    const phone = customerData.phone ? customerData.phone.replace(/\D/g, '') : '';
    if (!phone || phone.length < 10) {
      return "Telefone inválido";
    }
    
    return null;
  };
  
  const createOrder = async (
    paymentId: string, 
    status: 'pending' | 'confirmed',
    cardDetails?: CardDetails,
    pixDetails?: PixDetails
  ): Promise<Order> => {
    try {
      // Verificação dupla para prevenir criação de pedidos duplicados
      if (isProcessing || processingRef.current) {
        console.log("Criação de pedido já em andamento, prevenindo duplicação");
        throw new Error("Processamento em andamento. Por favor, aguarde.");
      }
      
      // Configurar ambos os estados para tracking
      setIsProcessing(true);
      processingRef.current = true;
      
      // Preparar os dados do cliente
      const customerData: CustomerData = {
        name: formState.fullName,
        email: formState.email,
        cpf: formState.cpf,
        phone: formState.phone,
        address: formState.street ? {
          street: formState.street,
          number: formState.number,
          complement: formState.complement,
          neighborhood: formState.neighborhood,
          city: formState.city,
          state: formState.state,
          postalCode: formState.cep.replace(/\D/g, '')
        } : undefined
      };
      
      // Validar dados do cliente
      const validationError = validateCustomerData(customerData);
      if (validationError) {
        console.error("Erro de validação ao criar pedido:", validationError);
        toast({
          title: "Erro de validação",
          description: validationError,
          variant: "destructive",
        });
        throw new Error(validationError);
      }
      
      console.log("Criando pedido com detalhes do produto:", {
        id: productDetails.id,
        name: productDetails.name,
        price: productDetails.price,
        isDigital: productDetails.isDigital
      });
      console.log("Estado do pedido:", status);
      console.log("Detalhes do cliente:", {
        name: formState.fullName,
        email: formState.email,
        cpf: formState.cpf,
        phone: formState.phone,
        hasAddress: !!formState.street
      });
      
      // Garantir que a marca do cartão seja definida para um valor padrão se não fornecida
      if (cardDetails && !cardDetails.brand) {
        cardDetails.brand = 'Desconhecida';
      }
      
      const orderData: CreateOrderInput = {
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
        deviceType: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        isDigitalProduct: productDetails.isDigital
      };

      console.log("Enviando dados do pedido:", {
        productId: orderData.productId,
        productName: orderData.productName,
        productPrice: orderData.productPrice,
        paymentMethod: orderData.paymentMethod,
        customerName: orderData.customer.name,
        customerEmail: orderData.customer.email
      });
      
      try {
        const newOrder = await addOrder(orderData);
        console.log("Pedido criado com sucesso:", {
          id: newOrder.id,
          productName: newOrder.productName,
          productPrice: newOrder.productPrice,
          paymentMethod: newOrder.paymentMethod,
          paymentStatus: newOrder.paymentStatus
        });
        
        // Chama a função handlePayment para completar o processo de checkout
        const paymentResult = {
          orderId: newOrder.id,
          status: newOrder.paymentStatus === 'Pago' ? 'confirmed' : 'pending',
          paymentMethod: newOrder.paymentMethod,
          cardDetails: newOrder.cardDetails,
          pixDetails: newOrder.pixDetails
        };
        
        handlePayment(paymentResult);
        
        toast({
          title: "Pedido criado",
          description: "Seu pedido foi registrado com sucesso!",
        });
        
        return newOrder;
      } catch (error) {
        console.error('Erro ao criar pedido:', error);
        toast({
          title: "Erro no pedido",
          description: "Não foi possível finalizar o pedido. Tente novamente.",
          variant: "destructive",
        });
        throw error;
      }
    } finally {
      // Garantir que os estados de processamento sejam resetados
      setTimeout(() => {
        setIsProcessing(false);
        processingRef.current = false;
      }, 2000);
    }
  };

  const customerData: CustomerData = {
    name: formState.fullName,
    email: formState.email,
    cpf: formState.cpf,
    phone: formState.phone,
    address: formState.street ? {
      street: formState.street,
      number: formState.number,
      complement: formState.complement,
      neighborhood: formState.neighborhood,
      city: formState.city,
      state: formState.state,
      postalCode: formState.cep.replace(/\D/g, '')
    } : undefined
  };

  return {
    createOrder,
    customerData,
    isProcessing
  };
};
