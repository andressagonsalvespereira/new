
import { useCallback } from 'react';
import { CardDetails, PixDetails, Order } from '@/types/order';

export const usePaymentWrapper = () => {
  /**
   * Handles order creation with proper logging for debugging
   */
  const handleOrderCreation = useCallback(
    async (
      paymentId: string,
      status: 'pending' | 'confirmed',
      createOrder: (
        paymentId: string,
        status: 'pending' | 'confirmed',
        cardDetails?: CardDetails,
        pixDetails?: PixDetails
      ) => Promise<Order>,
      cardDetails?: CardDetails,
      pixDetails?: PixDetails
    ): Promise<Order> => {
      console.log('Creating order with:', {
        paymentId,
        status,
        cardDetails: cardDetails ? '****' + (cardDetails.number?.slice(-4) || '') : undefined,
        pixDetails: pixDetails ? 'PIX details provided' : undefined
      });

      try {
        const order = await createOrder(paymentId, status, cardDetails, pixDetails);
        console.log('Order created successfully:', order.id);
        return order;
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    },
    []
  );

  return { handleOrderCreation };
};
