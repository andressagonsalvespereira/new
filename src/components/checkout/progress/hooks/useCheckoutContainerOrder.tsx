
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/contexts/OrderContext';
import { CreateOrderInput, CardDetails, PixDetails, PaymentMethod, PaymentStatus, Order } from '@/types/order';
import { ProductDetailsType } from '@/components/checkout/ProductDetails';

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
  handlePayment: () => void;
}

export const useCheckoutContainerOrder = ({
  formState,
  productDetails,
  handlePayment
}: UseCheckoutContainerOrderProps) => {
  const { addOrder } = useOrders();
  const { toast } = useToast();
  
  const createOrder = async (
    paymentId: string, 
    status: 'pending' | 'confirmed',
    cardDetails?: CardDetails,
    pixDetails?: PixDetails
  ): Promise<Order> => {
    try {
      console.log("Creating order with product details:", productDetails);
      console.log("Order status:", status);
      console.log("Card details:", cardDetails ? {...cardDetails, cvv: '***'} : 'None');
      console.log("PIX details:", pixDetails || 'None');
      
      // Ensure that credit card brand is set to a default value if not provided
      if (cardDetails && !cardDetails.brand) {
        cardDetails.brand = 'Desconhecida';
      }
      
      const orderData: CreateOrderInput = {
        customer: {
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
        },
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

      console.log("Sending order data:", {
        ...orderData,
        cardDetails: orderData.cardDetails ? {...orderData.cardDetails, cvv: '***'} : undefined
      });
      
      const newOrder = await addOrder(orderData);
      console.log("Order created successfully:", {
        id: newOrder.id,
        productName: newOrder.productName,
        productPrice: newOrder.productPrice,
        paymentMethod: newOrder.paymentMethod,
        paymentStatus: newOrder.paymentStatus
      });
      
      // Call the handlePayment function to complete the checkout process
      handlePayment();
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Erro no pedido",
        description: "Não foi possível finalizar o pedido. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const customerData = {
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
    customerData
  };
};
