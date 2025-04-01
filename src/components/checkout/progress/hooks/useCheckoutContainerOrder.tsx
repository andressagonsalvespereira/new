
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';
import { CustomerData } from '@/components/checkout/payment/shared/types';
import { validateCustomerData } from './utils/customerValidation';
import { createOrderService } from './services/orderCreationService';
import { UseCheckoutContainerOrderProps } from './types/checkoutOrderTypes';
import { Order, CardDetails, PixDetails } from '@/types/order';

export const useCheckoutContainerOrder = ({
  formState,
  productDetails,
  handlePayment
}: UseCheckoutContainerOrderProps) => {
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
      const customerData: CustomerData = prepareCustomerData(formState);
      
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
      
      const newOrder = await createOrderService({
        customerData,
        productDetails,
        status,
        paymentId,
        cardDetails,
        pixDetails,
        toast
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
      
      return newOrder;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: "Erro no pedido",
        description: "Não foi possível finalizar o pedido. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      // Garantir que os estados de processamento sejam resetados
      setTimeout(() => {
        setIsProcessing(false);
        processingRef.current = false;
      }, 2000);
    }
  };

  const prepareCustomerData = (formState: UseCheckoutContainerOrderProps['formState']): CustomerData => {
    return {
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
  };

  const customerData = prepareCustomerData(formState);

  return {
    createOrder,
    customerData,
    isProcessing
  };
};
