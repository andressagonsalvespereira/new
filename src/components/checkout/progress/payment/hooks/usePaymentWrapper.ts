
import { useCallback, useRef } from 'react';
import { CardDetails, PixDetails, Order } from '@/types/order';
import { logger } from '@/utils/logger';

export const usePaymentWrapper = () => {
  // Usar ref para rastrear o estado da criação do pedido e evitar duplicações
  const isProcessingRef = useRef(false);

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
      // Verificar se já está processando um pedido para evitar duplicação
      if (isProcessingRef.current) {
        logger.warn('Já existe um processamento de pedido em andamento, ignorando solicitação duplicada');
        throw new Error('Processamento em andamento, aguarde um momento');
      }

      isProcessingRef.current = true;

      try {
        const order = await createOrder(paymentId, status, cardDetails, pixDetails);
        return order;
      } catch (error) {
        logger.error('Error creating order:', error);
        throw error;
      } finally {
        // Importante: garantir que a flag seja resetada mesmo em caso de erro
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 1000);
      }
    },
    []
  );

  return { handleOrderCreation };
};
