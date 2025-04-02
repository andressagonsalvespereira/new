import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/contexts/order';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';
import { CustomerData } from '@/components/checkout/payment/shared/types';
import { validateCustomerData } from '@/components/checkout/progress/utils/customerValidation';
import { createOrderService } from './orderCreationService';
import { Order, CardDetails, PixDetails } from '@/types/order';
import { logger } from '@/utils/logger';

export const useCheckoutContainerOrder = ({
  formState,
  productDetails,
  handlePayment
}: UseCheckoutContainerOrderProps) => {
  const { toast } = useToast();
  const { addOrder } = useOrders();
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  // Reset processing state after timeout
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isProcessing) {
      timeout = setTimeout(() => {
        setIsProcessing(false);
        processingRef.current = false;
        logger.warn("Resetting processing state after safety timeout");
      }, 30000);
    }

    return () => clearTimeout(timeout);
  }, [isProcessing]);

  const createOrder = async (
    paymentId: string,
    status: 'pending' | 'confirmed',
    cardDetails?: CardDetails,
    pixDetails?: PixDetails
  ): Promise<Order> => {
    try {
      if (isProcessing || processingRef.current) {
        logger.warn("Order creation already in progress, preventing duplication");
        throw new Error("Processing in progress. Please wait.");
      }

      setIsProcessing(true);
      processingRef.current = true;

      // ⚠️ Agora os dados são sempre atualizados no momento da chamada
      const customerData: CustomerData = prepareCustomerData(formState);

      const validationError = validateCustomerData(customerData);
      if (validationError) {
        logger.error("Validation error when creating order:", validationError);
        toast({
          title: "Validation error",
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
        toast,
        addOrder
      });

      handlePayment({ orderData: newOrder });

      return newOrder;
    } catch (error) {
      logger.error('Error creating order:', error);
      toast({
        title: "Order error",
        description: "It wasn't possible to complete the order. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
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

  return {
    createOrder,
    customerData: prepareCustomerData(formState), // ✅ atualizado dinamicamente
    isProcessing
  };
};
